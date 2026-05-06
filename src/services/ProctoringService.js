import {
  FaceDetector,
  FilesetResolver
} from "@mediapipe/tasks-vision";

const DEFAULT_WASM_BASE =
  import.meta.env.VITE_MEDIAPIPE_WASM_PATH ||
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm";
const DEFAULT_MODEL_ASSET =
  import.meta.env.VITE_FACE_MODEL_PATH ||
  "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";
const VIOLATION_COOLDOWN_MS = 6000;

export const PROCTORING_STATUS = {
  IDLE: "Idle",
  INITIALIZING: "Initializing",
  READY: "Face detected",
  NO_FACE: "No face detected",
  MULTIPLE_FACES: "Multiple faces detected",
  FACE_OFF_CENTER: "Face not centered",
  CAMERA_DENIED: "Camera permission denied",
  CAMERA_ERROR: "Camera unavailable"
};

export class ProctoringService {
  constructor({
    videoElement,
    onStatusChange,
    onViolation,
    onError,
    onReady,
    intervalMs = 1500,
    faceMissingThresholdMs = 5000,
    maxNoFaceWarnings = 2,
    maxMultipleFaceWarnings = 2,
    maxOffCenterWarnings = 3,
    wasmBasePath = DEFAULT_WASM_BASE,
    modelAssetPath = DEFAULT_MODEL_ASSET
  }) {
    this.videoElement = videoElement;
    this.onStatusChange = onStatusChange;
    this.onViolation = onViolation;
    this.onError = onError;
    this.onReady = onReady;
    this.intervalMs = intervalMs;
    this.faceMissingThresholdMs = faceMissingThresholdMs;
    this.maxNoFaceWarnings = maxNoFaceWarnings;
    this.maxMultipleFaceWarnings = maxMultipleFaceWarnings;
    this.maxOffCenterWarnings = maxOffCenterWarnings;
    this.wasmBasePath = wasmBasePath;
    this.modelAssetPath = modelAssetPath;

    this.faceDetector = null;
    this.stream = null;
    this.intervalId = null;
    this.lastFaceSeenAt = null;
    this.warningCounts = {
      noFace: 0,
      multipleFaces: 0,
      offCenter: 0
    };
    this.lastViolationAt = {
      noFace: 0,
      multipleFaces: 0,
      offCenter: 0
    };
    this.permissionState = "pending";
  }

  async start() {
    try {
      this.onStatusChange?.(PROCTORING_STATUS.INITIALIZING);
      await this.setupCamera();
      await this.setupDetector();

      this.lastFaceSeenAt = Date.now();
      this.intervalId = window.setInterval(() => {
        this.runDetection();
      }, this.intervalMs);

      this.onReady?.();
    } catch (error) {
      this.handleStartupError(error);
      throw error;
    }
  }

  async setupCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });
    } catch (error) {
      this.permissionState =
        error?.name === "NotAllowedError" ? "denied" : "failed";
      throw error;
    }

    this.videoElement.srcObject = this.stream;

    await new Promise((resolve, reject) => {
      const handleLoaded = () => {
        this.videoElement.play().then(resolve).catch(reject);
      };

      this.videoElement.onloadedmetadata = handleLoaded;
    });
  }

  async setupDetector() {
    const vision = await FilesetResolver.forVisionTasks(this.wasmBasePath);

    this.faceDetector = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: this.modelAssetPath
      },
      runningMode: "VIDEO",
      minDetectionConfidence: 0.55
    });
  }

  runDetection() {
    if (!this.faceDetector || !this.videoElement || this.videoElement.readyState < 2) {
      return;
    }

    const now = performance.now();
    const result = this.faceDetector.detectForVideo(this.videoElement, now);
    const detections = result?.detections ?? [];

    if (detections.length === 0) {
      this.handleNoFace();
      return;
    }

    this.lastFaceSeenAt = Date.now();

    if (detections.length > 1) {
      this.onStatusChange?.(PROCTORING_STATUS.MULTIPLE_FACES);
      this.raiseViolation(
        "multipleFaces",
        "Multiple people detected. Please ensure only one person is in frame.",
        this.maxMultipleFaceWarnings
      );
      return;
    }

    const primaryFace = detections[0];
    const centered = this.isFaceCentered(primaryFace.boundingBox);

    if (!centered) {
      this.onStatusChange?.(PROCTORING_STATUS.FACE_OFF_CENTER);
      this.raiseViolation(
        "offCenter",
        "Face not centered. Please stay inside the camera frame.",
        this.maxOffCenterWarnings
      );
      return;
    }

    this.onStatusChange?.(PROCTORING_STATUS.READY);
  }

  handleNoFace() {
    const elapsed = Date.now() - (this.lastFaceSeenAt ?? Date.now());

    this.onStatusChange?.(PROCTORING_STATUS.NO_FACE);

    if (elapsed < this.faceMissingThresholdMs) {
      return;
    }

    this.lastFaceSeenAt = Date.now();
    this.raiseViolation(
      "noFace",
      "Face not detected for more than 5 seconds.",
      this.maxNoFaceWarnings
    );
  }

  isFaceCentered(boundingBox) {
    if (!boundingBox || !this.videoElement?.videoWidth || !this.videoElement?.videoHeight) {
      return true;
    }

    const videoWidth = this.videoElement.videoWidth;
    const videoHeight = this.videoElement.videoHeight;
    const centerX = boundingBox.originX + boundingBox.width / 2;
    const centerY = boundingBox.originY + boundingBox.height / 2;
    const insideHorizontalBand =
      centerX > videoWidth * 0.25 && centerX < videoWidth * 0.75;
    const insideVerticalBand =
      centerY > videoHeight * 0.2 && centerY < videoHeight * 0.8;
    const largeEnough =
      boundingBox.width > videoWidth * 0.16 &&
      boundingBox.height > videoHeight * 0.16;

    return insideHorizontalBand && insideVerticalBand && largeEnough;
  }

  raiseViolation(type, message, limit) {
    const now = Date.now();

    if (now - this.lastViolationAt[type] < VIOLATION_COOLDOWN_MS) {
      return;
    }

    this.lastViolationAt[type] = now;
    this.warningCounts[type] += 1;

    const totalWarnings = Object.values(this.warningCounts).reduce(
      (sum, count) => sum + count,
      0
    );
    const shouldAutoSubmit = this.warningCounts[type] >= limit;

    this.onViolation?.({
      type,
      message,
      count: this.warningCounts[type],
      totalWarnings,
      shouldAutoSubmit
    });
  }

  handleStartupError(error) {
    if (this.permissionState === "denied") {
      this.onStatusChange?.(PROCTORING_STATUS.CAMERA_DENIED);
      this.onError?.(
        "Camera permission was denied. Please allow webcam access to start the proctored quiz."
      );
      return;
    }

    this.onStatusChange?.(PROCTORING_STATUS.CAMERA_ERROR);
    this.onError?.(
      error?.message ||
        "Unable to initialize camera or face detection. Please refresh and try again."
    );
  }

  stop() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.faceDetector) {
      this.faceDetector.close();
      this.faceDetector = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.srcObject = null;
    }
  }
}

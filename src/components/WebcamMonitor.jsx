import { useEffect, useRef, useState } from "react";
import { PROCTORING_STATUS, ProctoringService } from "../services/ProctoringService";

const STATUS_VARIANTS = {
  [PROCTORING_STATUS.CAMERA_READY]: "ok",
  [PROCTORING_STATUS.DETECTOR_ERROR]: "danger",
  [PROCTORING_STATUS.READY]: "ok",
  [PROCTORING_STATUS.NO_FACE]: "danger",
  [PROCTORING_STATUS.MULTIPLE_FACES]: "warn",
  [PROCTORING_STATUS.FACE_OFF_CENTER]: "warn",
  [PROCTORING_STATUS.CAMERA_DENIED]: "danger",
  [PROCTORING_STATUS.CAMERA_ERROR]: "danger",
  [PROCTORING_STATUS.INITIALIZING]: "neutral",
  [PROCTORING_STATUS.IDLE]: "neutral"
};

export default function WebcamMonitor({
  enabled,
  monitoringActive,
  onViolation,
  onReady,
  onError,
  onStatusChange
}) {
  const videoRef = useRef(null);
  const serviceRef = useRef(null);
  const [status, setStatus] = useState(PROCTORING_STATUS.IDLE);

  useEffect(() => {
    if (!enabled || !videoRef.current) {
      return undefined;
    }

    const service = new ProctoringService({
      videoElement: videoRef.current,
      onReady,
      onError,
      onViolation,
      onStatusChange: (nextStatus) => {
        setStatus(nextStatus);
        onStatusChange?.(nextStatus);
      }
    });

    serviceRef.current = service;
    service.startCamera().catch(() => {});

    return () => {
      service.stop();
      serviceRef.current = null;
    };
  }, [enabled, onError, onReady, onStatusChange, onViolation]);

  useEffect(() => {
    if (!enabled || !monitoringActive || !serviceRef.current) {
      return;
    }

    serviceRef.current.startMonitoring().catch(() => {});
  }, [enabled, monitoringActive]);

  const statusVariant = STATUS_VARIANTS[status] ?? "neutral";

  return (
    <aside className="proctor-box">
      <div className="proctor-header">
        <div>
          <p className="eyebrow">AI Proctoring</p>
          <h2>Live monitor</h2>
        </div>
        <span className={`status-pill ${statusVariant}`}>{status}</span>
      </div>

      <div className="video-shell">
        <video ref={videoRef} muted playsInline autoPlay />
      </div>

      <ul className="proctor-rules">
        <li>Face detected: safe to continue</li>
        <li>No face for 5s: warning</li>
        <li>Multiple faces: warning</li>
        <li>Frequent off-center face: warning</li>
      </ul>
    </aside>
  );
}

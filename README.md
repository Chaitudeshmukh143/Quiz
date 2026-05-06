# Advanced Java OOPs Quiz with Browser Proctoring

This project is a React + Vite quiz application with browser-only AI proctoring.

## Install

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Proctoring library

This app uses `@mediapipe/tasks-vision` for in-browser face detection.

Installed automatically through:

```bash
npm install @mediapipe/tasks-vision react react-dom
npm install -D vite @vitejs/plugin-react
```

## Model loading

By default, the app loads:

- MediaPipe WASM from jsDelivr
- The BlazeFace short-range model from the official MediaPipe storage URL

If you want local model loading instead of CDN URLs:

1. Download the face model file:
   `blaze_face_short_range.tflite`
2. Place it in `public/models/blaze_face_short_range.tflite`
3. Place the MediaPipe wasm folder files in `public/mediapipe/wasm`
4. Copy `.env.example` to `.env`
5. Update:

```env
VITE_MEDIAPIPE_WASM_PATH=/mediapipe/wasm
VITE_FACE_MODEL_PATH=/models/blaze_face_short_range.tflite
```

## File structure

- `src/components/WebcamMonitor.jsx`: webcam UI and proctoring lifecycle
- `src/services/ProctoringService.js`: MediaPipe setup, polling, violations, cleanup
- `src/components/Quiz.jsx`: quiz flow, warnings, score, auto-submit integration
- `src/data/questions.js`: 30 advanced Java OOP questions

## Proctoring rules

- No face for more than 5 seconds: warning
- Multiple faces: warning
- Face repeatedly off-center: warning
- Reaching a violation limit auto-submits the quiz

## Notes

- Everything runs in the browser
- No backend or database is required
- Webcam tracks are stopped automatically on submit or component unmount

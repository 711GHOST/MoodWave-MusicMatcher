import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { Icon } from "@iconify/react";
import Spinner from "../shared/Spinner";

// Self-hosted from client/public/models - works offline, no CDN dependency.
const MODEL_URL = `${process.env.PUBLIC_URL || ""}/models`;

const EXPRESSION_TO_EMOTION = {
  neutral: "neutral",
  happy: "happy",
  sad: "sad",
  angry: "angry",
  fearful: "fear",
  disgusted: "disgust",
  surprised: "surprise",
};

const MoodDetector = ({ onDetected }) => {
  const webcamRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        if (!cancelled) setModelsLoaded(true);
      } catch (e) {
        if (!cancelled) setLoadError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const scan = async () => {
    const video = webcamRef.current?.video;
    if (!video || video.readyState !== 4) {
      setStatus("Camera isn't ready yet - give it a moment and try again.");
      return;
    }
    setScanning(true);
    setStatus("Reading your expression…");
    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();
      if (!detection) {
        setStatus("No face detected. Center your face in the frame and retry.");
        return;
      }
      const top = Object.entries(detection.expressions).sort(
        (a, b) => b[1] - a[1]
      )[0][0];
      onDetected(EXPRESSION_TO_EMOTION[top] || "neutral");
    } catch (e) {
      setStatus("Something went wrong while scanning. Please try again.");
    } finally {
      setScanning(false);
    }
  };

  if (loadError) {
    return (
      <div className="bg-ink-800 rounded-2xl p-6 text-center text-ink-400 text-sm">
        Couldn't load the face-detection models (you may be offline). Use “Pick
        manually” instead.
      </div>
    );
  }

  return (
    <div className="bg-ink-800 rounded-2xl p-6 flex flex-col items-center gap-4">
      <div className="relative w-full max-w-sm aspect-video rounded-xl overflow-hidden bg-black">
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "user" }}
          className="w-full h-full object-cover"
        />
        {!modelsLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <Spinner size={32} />
          </div>
        )}
      </div>
      <p className="text-xs text-ink-500 text-center max-w-sm">
        Your camera runs entirely in your browser - no images are uploaded or
        stored.
      </p>
      {status && <p className="text-sm text-ink-300 text-center">{status}</p>}
      <button
        onClick={scan}
        disabled={!modelsLoaded || scanning}
        className="flex items-center gap-2 bg-brand hover:bg-brand-light text-black font-bold px-6 py-3 rounded-full transition disabled:opacity-60"
      >
        {scanning ? (
          <Spinner size={20} className="text-black" />
        ) : (
          <Icon icon="mdi:face-recognition" width={22} />
        )}
        {modelsLoaded ? "Scan my mood" : "Loading camera AI…"}
      </button>
    </div>
  );
};

export default MoodDetector;

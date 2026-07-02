// The 7 mood tags (face-api.js expressions) a song can carry. Each maps to a
// mood playlist server-side. Colors/labels drive the tag chips + upload picker.
export const MOODS = [
  { key: "happy", label: "Happy", color: "#eab308" },
  { key: "sad", label: "Sad", color: "#3b82f6" },
  { key: "angry", label: "Angry", color: "#ef4444" },
  { key: "neutral", label: "Neutral", color: "#9ca3af" },
  { key: "surprise", label: "Surprise", color: "#a855f7" },
  { key: "fear", label: "Fear", color: "#6366f1" },
  { key: "disgust", label: "Disgust", color: "#22c55e" },
];

export const MOOD_BY_KEY = Object.fromEntries(MOODS.map((m) => [m.key, m]));

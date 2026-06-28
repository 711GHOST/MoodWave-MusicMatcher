const MOODS = [
  { emotion: "happy", label: "Happy", emoji: "😊" },
  { emotion: "sad", label: "Sad", emoji: "😢" },
  { emotion: "angry", label: "Angry", emoji: "😠" },
  { emotion: "neutral", label: "Neutral", emoji: "😐" },
  { emotion: "surprise", label: "Surprised", emoji: "😲" },
  { emotion: "fear", label: "Anxious", emoji: "😨" },
  { emotion: "disgust", label: "Meh", emoji: "🙄" },
];

const MoodPicker = ({ onPick }) => (
  <div className="bg-ink-800 rounded-2xl p-6">
    <p className="text-sm text-ink-400 mb-4">
      Prefer not to use the camera? Tap how you feel:
    </p>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {MOODS.map((m) => (
        <button
          key={m.emotion}
          onClick={() => onPick(m.emotion)}
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-ink-750 hover:bg-ink-700 border border-ink-700 hover:border-brand transition"
        >
          <span className="text-3xl" aria-hidden>
            {m.emoji}
          </span>
          <span className="text-sm font-semibold text-white">{m.label}</span>
        </button>
      ))}
    </div>
  </div>
);

export default MoodPicker;

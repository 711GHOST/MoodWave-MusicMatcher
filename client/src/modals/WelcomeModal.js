import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import Brand from "../components/shared/Brand";

const FEATURES = [
  {
    icon: "mdi:face-recognition",
    title: "Detect your mood",
    text: "Scan your face or pick how you feel for a tailored playlist.",
  },
  {
    icon: "mdi:playlist-music",
    title: "Build your library",
    text: "Create playlists, like songs, and upload your own tracks.",
  },
  {
    icon: "mdi:music-circle",
    title: "A full player",
    text: "Queue, shuffle, repeat, seek and volume - everything you expect.",
  },
];

const WelcomeModal = ({ name, onClose }) => {
  const navigate = useNavigate();
  const go = (path) => {
    onClose();
    if (path) navigate(path);
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-ink-850 border border-ink-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 text-white/70 hover:text-white"
        >
          <Icon icon="mdi:close" width={22} />
        </button>
        <div className="bg-gradient-to-br from-accent/40 via-brand/20 to-ink-850 p-8 text-center">
          <div className="flex justify-center mb-3">
            <Brand iconSize={44} />
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Welcome{name ? `, ${name}` : ""}! 🎉
          </h2>
          <p className="text-ink-200 mt-2 text-sm">
            You're all set. Here's what you can do with Moodwave.
          </p>
        </div>
        <div className="p-6 space-y-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-ink-800 flex items-center justify-center shrink-0">
                <Icon icon={f.icon} width={22} className="text-brand" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">{f.title}</div>
                <div className="text-ink-400 text-xs">{f.text}</div>
              </div>
            </div>
          ))}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => go("/mood")}
              className="flex-1 bg-brand hover:bg-brand-light text-black font-bold py-3 rounded-full transition flex items-center justify-center gap-2"
            >
              <Icon icon="mdi:emoticon-happy" width={20} /> Check my mood
            </button>
            <button
              onClick={() => go(null)}
              className="flex-1 border border-ink-600 hover:border-white text-white font-semibold py-3 rounded-full transition"
            >
              Start exploring
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;

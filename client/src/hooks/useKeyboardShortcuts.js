import { useEffect } from "react";
import { usePlayer } from "../context/PlayerContext";

// Spotify-style global player shortcuts. Ignored while typing in a field.
export default function useKeyboardShortcuts() {
  const {
    currentSong,
    togglePlay,
    next,
    prev,
    volume,
    setVolume,
    toggleMute,
  } = usePlayer();

  useEffect(() => {
    const onKey = (e) => {
      // Don't hijack typing or browser/OS shortcuts.
      const el = e.target;
      const tag = el?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        el?.isContentEditable ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      ) {
        return;
      }
      if (!currentSong) return;

      switch (e.key) {
        case " ":
          e.preventDefault(); // avoid scrolling the page
          togglePlay();
          break;
        case "ArrowRight":
          next();
          break;
        case "ArrowLeft":
          prev();
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.05));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.05));
          break;
        case "m":
        case "M":
          toggleMute();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentSong, togglePlay, next, prev, volume, setVolume, toggleMute]);
}

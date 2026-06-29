import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { usePlayer } from "../../context/PlayerContext";
import { useToast } from "../../context/ToastContext";

const SLEEP_OPTIONS = [
  { label: "Off", value: 0 },
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "45 minutes", value: 45 },
  { label: "1 hour", value: 60 },
  { label: "End of track", value: "end" },
];

// Dropdown that arms a sleep timer (minutes or end-of-track). `align` controls
// which edge the menu opens from so it fits in both panels.
const SleepTimer = ({ align = "right" }) => {
  const { sleepMinutes, sleepEndOfTrack, setSleepTimer } = usePlayer();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const active = sleepMinutes != null || sleepEndOfTrack;
  const choose = (opt) => {
    setSleepTimer(opt.value);
    setOpen(false);
    toast.success(
      opt.value ? `Sleep timer: ${opt.label.toLowerCase()}.` : "Sleep timer off."
    );
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Sleep timer"
        className={`flex items-center gap-1 text-xs ${
          active ? "text-brand" : "text-ink-400 hover:text-white"
        }`}
      >
        <Icon icon="mdi:moon-waning-crescent" width={18} />
        {sleepMinutes != null && <span>{sleepMinutes}m</span>}
        {sleepEndOfTrack && <span>end</span>}
      </button>
      {open && (
        <div
          className={`absolute top-7 w-44 bg-ink-800 border border-ink-700 rounded-xl shadow-2xl p-1 z-30 animate-scale-in ${
            align === "left" ? "left-0" : "right-0"
          }`}
        >
          {SLEEP_OPTIONS.map((opt) => {
            const isActive =
              (opt.value === "end" && sleepEndOfTrack) ||
              (typeof opt.value === "number" &&
                opt.value !== 0 &&
                sleepMinutes != null &&
                opt.value === sleepMinutes) ||
              (opt.value === 0 && !active);
            return (
              <button
                key={opt.label}
                onClick={() => choose(opt)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${
                  isActive
                    ? "text-brand bg-ink-700"
                    : "text-ink-300 hover:text-white hover:bg-ink-700"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SleepTimer;

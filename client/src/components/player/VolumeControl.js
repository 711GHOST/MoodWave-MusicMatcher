import { Icon } from "@iconify/react";

const VolumeControl = ({ volume, onChange, muted, onToggleMute }) => {
  const icon =
    muted || volume === 0
      ? "mdi:volume-mute"
      : volume < 0.5
      ? "mdi:volume-medium"
      : "mdi:volume-high";

  return (
    <div className="flex items-center gap-2 w-28 max-w-full">
      <button
        onClick={onToggleMute}
        aria-label={muted ? "Unmute" : "Mute"}
        className="text-ink-400 hover:text-white shrink-0"
      >
        <Icon icon={icon} width={20} />
      </button>
      {/* min-w-0 lets flex-1 shrink the range below its intrinsic width so the
          native slider can't overflow the player bar / viewport. */}
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={muted ? 0 : volume}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="mw-range flex-1 min-w-0"
        aria-label="Volume"
      />
    </div>
  );
};

export default VolumeControl;

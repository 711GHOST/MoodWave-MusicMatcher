import { Icon } from "@iconify/react";

const VolumeControl = ({ volume, onChange }) => {
  const icon =
    volume === 0
      ? "mdi:volume-mute"
      : volume < 0.5
      ? "mdi:volume-medium"
      : "mdi:volume-high";

  return (
    <div className="flex items-center gap-2 w-32">
      <Icon icon={icon} width={20} className="text-ink-400 shrink-0" />
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="mw-range flex-1"
        aria-label="Volume"
      />
    </div>
  );
};

export default VolumeControl;

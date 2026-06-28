import { useRef, useState } from "react";
import { formatTime } from "../../utils/format";

const ProgressBar = ({ progress, duration, onSeek }) => {
  const ref = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [dragVal, setDragVal] = useState(0);

  const value = dragging ? dragVal : progress;
  const pct = duration ? Math.min(100, (value / duration) * 100) : 0;

  const valueFromEvent = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
    return rect.width ? (x / rect.width) * duration : 0;
  };

  const onPointerDown = (e) => {
    if (!duration) return;
    setDragging(true);
    setDragVal(valueFromEvent(e));
    ref.current.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (dragging) setDragVal(valueFromEvent(e));
  };
  const onPointerUp = (e) => {
    if (dragging) {
      onSeek(valueFromEvent(e));
      setDragging(false);
    }
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-[11px] text-ink-500 w-10 text-right tabular-nums">
        {formatTime(value)}
      </span>
      <div
        ref={ref}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="group relative h-1.5 flex-1 bg-ink-700 rounded-full cursor-pointer"
      >
        <div
          className="absolute inset-y-0 left-0 bg-white group-hover:bg-brand rounded-full"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100"
          style={{ left: `calc(${pct}% - 6px)` }}
        />
      </div>
      <span className="text-[11px] text-ink-500 w-10 tabular-nums">
        {formatTime(duration)}
      </span>
    </div>
  );
};

export default ProgressBar;

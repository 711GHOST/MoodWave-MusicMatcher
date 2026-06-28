import { useRef, useState } from "react";
import { useSettings, EQ_BANDS } from "../../context/SettingsContext";

const MIN = -12;
const MAX = 12;
const W = 640;
const H = 240;
const PAD_X = 44;
const PAD_Y = 28;
const INNER_W = W - PAD_X * 2;
const INNER_H = H - PAD_Y * 2;

// Interactive 6-band equalizer. Drag a node up/down to set its gain (dB).
const Equalizer = () => {
  const { settings, setEqBand } = useSettings();
  const bands = settings.equalizer;
  const svgRef = useRef(null);
  const [dragging, setDragging] = useState(null);

  const xFor = (i) => PAD_X + (INNER_W * i) / (bands.length - 1);
  const yFor = (db) => PAD_Y + INNER_H * (1 - (db - MIN) / (MAX - MIN));

  const dbFromClientY = (clientY) => {
    const rect = svgRef.current.getBoundingClientRect();
    const vy = ((clientY - rect.top) / rect.height) * H;
    const db = MIN + (1 - (vy - PAD_Y) / INNER_H) * (MAX - MIN);
    return Math.max(MIN, Math.min(MAX, Math.round(db)));
  };

  const onPointerDown = (i) => (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(i);
  };
  const onPointerMove = (e) => {
    if (dragging == null) return;
    setEqBand(dragging, dbFromClientY(e.clientY));
  };
  const stop = () => setDragging(null);

  const points = bands.map((db, i) => `${xFor(i)},${yFor(db)}`).join(" ");
  const area = `${PAD_X},${H - PAD_Y} ${points} ${W - PAD_X},${H - PAD_Y}`;

  return (
    <div className="bg-ink-800/60 rounded-2xl p-4">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none select-none"
        onPointerMove={onPointerMove}
        onPointerUp={stop}
        onPointerLeave={stop}
      >
        <defs>
          <linearGradient id="eqFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Scale labels */}
        <text x={PAD_X - 8} y={PAD_Y + 4} textAnchor="end" className="fill-ink-400" fontSize="13">
          +12dB
        </text>
        <text x={PAD_X - 8} y={H - PAD_Y + 4} textAnchor="end" className="fill-ink-400" fontSize="13">
          -12dB
        </text>

        {/* Vertical gridlines + frequency labels */}
        {bands.map((_, i) => (
          <g key={i}>
            <line
              x1={xFor(i)}
              y1={PAD_Y}
              x2={xFor(i)}
              y2={H - PAD_Y}
              stroke="#ffffff"
              strokeOpacity="0.08"
            />
            <text
              x={xFor(i)}
              y={H - 6}
              textAnchor="middle"
              className="fill-ink-400"
              fontSize="13"
            >
              {EQ_BANDS[i]}
            </text>
          </g>
        ))}

        {/* 0 dB midline */}
        <line
          x1={PAD_X}
          y1={yFor(0)}
          x2={W - PAD_X}
          y2={yFor(0)}
          stroke="#ffffff"
          strokeOpacity="0.12"
          strokeDasharray="4 4"
        />

        {/* Curve + fill */}
        <polygon points={area} fill="url(#eqFill)" />
        <polyline
          points={points}
          fill="none"
          stroke="#1ed760"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Draggable nodes */}
        {bands.map((db, i) => (
          <g key={`n${i}`}>
            <circle
              cx={xFor(i)}
              cy={yFor(db)}
              r="9"
              fill="#1ed760"
              className="cursor-ns-resize"
              onPointerDown={onPointerDown(i)}
            />
            {dragging === i && (
              <text
                x={xFor(i)}
                y={yFor(db) - 16}
                textAnchor="middle"
                className="fill-white"
                fontSize="13"
                fontWeight="700"
              >
                {db > 0 ? `+${db}` : db}dB
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

export default Equalizer;

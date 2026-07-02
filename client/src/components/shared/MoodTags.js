import { MOOD_BY_KEY } from "../../utils/moods";

// Renders a song's mood tags as small colored chips. Returns null when a song
// has no moods so callers can drop it in unconditionally.
const MoodTags = ({ moods, className = "" }) => {
  const list = (moods || []).filter((m) => MOOD_BY_KEY[m]);
  if (!list.length) return null;
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {list.map((m) => {
        const meta = MOOD_BY_KEY[m];
        return (
          <span
            key={m}
            className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none"
            style={{ backgroundColor: `${meta.color}22`, color: meta.color }}
          >
            {meta.label}
          </span>
        );
      })}
    </div>
  );
};

export default MoodTags;

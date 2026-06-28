import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { usePlayer } from "../../context/PlayerContext";
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { toggleLike } from "../../api/songs";
import { artistName, onImgError } from "../../utils/format";

const SLEEP_OPTIONS = [
  { label: "Off", value: 0 },
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "45 minutes", value: 45 },
  { label: "1 hour", value: 60 },
  { label: "End of track", value: "end" },
];

const SleepTimer = () => {
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
        <div className="absolute right-0 top-7 w-44 bg-ink-800 border border-ink-700 rounded-xl shadow-2xl p-1 z-30 animate-scale-in">
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

// Right-hand panel showing the current track and the upcoming queue.
const NowPlayingPanel = () => {
  const { currentSong, queue, index, isPlaying, playIndex, removeFromQueue } =
    usePlayer();
  const { closeNowPlaying } = useUI();
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  if (!currentSong) return null;

  const liked = (user?.likedSongs || []).some(
    (s) => (s._id || s) === currentSong._id
  );

  const onLike = async () => {
    try {
      await toggleLike(currentSong._id);
      await refreshUser();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const upcoming = queue
    .map((song, i) => ({ song, i }))
    .filter(({ i }) => i > index);

  return (
    <aside className="hidden lg:flex flex-col w-80 shrink-0 bg-ink-950 m-2 ml-0 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-ink-800">
        <span className="font-bold text-white truncate">Now playing</span>
        <div className="flex items-center gap-3">
          <SleepTimer />
          <button
            onClick={closeNowPlaying}
            aria-label="Close now playing"
            className="text-ink-400 hover:text-white"
          >
            <Icon icon="mdi:close" width={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        <img
          src={currentSong.thumbnail}
          onError={onImgError}
          alt=""
          className="w-full aspect-square rounded-xl object-cover shadow-2xl"
        />
        <div className="flex items-start justify-between gap-3 mt-4">
          <div className="min-w-0">
            <div className="text-xl font-extrabold text-white truncate">
              {currentSong.name}
            </div>
            <div className="text-sm text-ink-400 truncate">
              {artistName(currentSong.artist)}
            </div>
          </div>
          <button
            onClick={onLike}
            aria-label={liked ? "Unlike" : "Like"}
            className={`mt-1 shrink-0 ${
              liked ? "text-brand" : "text-ink-500 hover:text-white"
            }`}
          >
            <Icon icon={liked ? "mdi:heart" : "mdi:heart-outline"} width={24} />
          </button>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white">Next in queue</h3>
            <span className="text-xs text-ink-500">{upcoming.length} tracks</span>
          </div>

          {upcoming.length === 0 ? (
            <p className="text-sm text-ink-500 py-4">
              You're at the end of the queue.
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {upcoming.map(({ song, i }) => (
                <li key={`${song._id}-${i}`} className="group flex items-center">
                  <button
                    onClick={() => playIndex(i)}
                    className="flex-1 min-w-0 flex items-center gap-3 p-2 rounded-lg hover:bg-ink-800 transition text-left"
                  >
                    <img
                      src={song.thumbnail}
                      onError={onImgError}
                      alt=""
                      className="h-10 w-10 rounded object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-white truncate">{song.name}</div>
                      <div className="text-xs text-ink-500 truncate">
                        {artistName(song.artist)}
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => removeFromQueue(i)}
                    aria-label="Remove from queue"
                    className="shrink-0 p-1 mr-1 text-ink-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Icon icon="mdi:close" width={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="px-4 py-3 border-t border-ink-800 flex items-center gap-2 text-xs text-ink-500">
        <Icon
          icon={isPlaying ? "mdi:music-note" : "mdi:pause"}
          width={16}
          className={isPlaying ? "text-brand" : ""}
        />
        {isPlaying ? "Playing now" : "Paused"}
      </div>
    </aside>
  );
};

export default NowPlayingPanel;

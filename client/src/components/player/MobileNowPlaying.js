import { Icon } from "@iconify/react";
import { usePlayer } from "../../context/PlayerContext";
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { toggleLike } from "../../api/songs";
import { artistName, onImgError } from "../../utils/format";
import ProgressBar from "./ProgressBar";
import SleepTimer from "./SleepTimer";

// Full-screen "Now playing" sheet for small screens (the side panel is lg+ only).
const MobileNowPlaying = () => {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    next,
    prev,
    progress,
    duration,
    seekTo,
    shuffle,
    toggleShuffle,
    repeat,
    cycleRepeat,
    queue,
    index,
    playIndex,
    removeFromQueue,
  } = usePlayer();
  const { mobileNowPlayingOpen, closeMobileNowPlaying, openAddToPlaylist } = useUI();
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  if (!mobileNowPlayingOpen || !currentSong) return null;

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
    <div className="lg:hidden fixed inset-0 z-50 bg-gradient-to-b from-ink-800 to-ink-950 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 shrink-0">
        <button
          onClick={closeMobileNowPlaying}
          aria-label="Close now playing"
          className="text-white"
        >
          <Icon icon="mdi:chevron-down" width={28} />
        </button>
        <span className="text-sm font-semibold text-white">Now playing</span>
        <SleepTimer align="right" />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6 flex flex-col">
        {/* Artwork */}
        <img
          src={currentSong.thumbnail}
          onError={onImgError}
          alt=""
          className="w-full max-w-sm mx-auto aspect-square rounded-2xl object-cover shadow-2xl mt-2"
        />

        {/* Title + like */}
        <div className="flex items-start justify-between gap-3 mt-6">
          <div className="min-w-0">
            <div className="text-2xl font-extrabold text-white truncate">
              {currentSong.name}
            </div>
            <div className="text-ink-400 truncate">
              {artistName(currentSong.artist)}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 mt-1">
            <button
              onClick={() => openAddToPlaylist(currentSong._id)}
              aria-label="Add to playlist"
              className="text-ink-400 hover:text-white"
            >
              <Icon icon="mdi:playlist-plus" width={24} />
            </button>
            <button
              onClick={onLike}
              aria-label={liked ? "Unlike" : "Like"}
              className={liked ? "text-brand" : "text-ink-400 hover:text-white"}
            >
              <Icon icon={liked ? "mdi:heart" : "mdi:heart-outline"} width={26} />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6">
          <ProgressBar progress={progress} duration={duration} onSeek={seekTo} />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={toggleShuffle}
            aria-label="Shuffle"
            className={shuffle ? "text-brand" : "text-ink-400"}
          >
            <Icon icon="mdi:shuffle-variant" width={24} />
          </button>
          <button onClick={prev} aria-label="Previous" className="text-white">
            <Icon icon="mdi:skip-previous" width={40} />
          </button>
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition"
          >
            <Icon icon={isPlaying ? "mdi:pause" : "mdi:play"} width={36} />
          </button>
          <button onClick={next} aria-label="Next" className="text-white">
            <Icon icon="mdi:skip-next" width={40} />
          </button>
          <button
            onClick={cycleRepeat}
            aria-label="Repeat"
            className={repeat !== "off" ? "text-brand" : "text-ink-400"}
          >
            <Icon icon={repeat === "one" ? "mdi:repeat-once" : "mdi:repeat"} width={24} />
          </button>
        </div>

        {/* Queue */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white">Next in queue</h3>
            <span className="text-xs text-ink-500">{upcoming.length} tracks</span>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-ink-500 py-3">
              You're at the end of the queue.
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {upcoming.map(({ song, i }) => (
                <li key={`${song._id}-${i}`} className="flex items-center">
                  <button
                    onClick={() => playIndex(i)}
                    className="flex-1 min-w-0 flex items-center gap-3 p-2 rounded-lg active:bg-ink-800 text-left"
                  >
                    <img
                      src={song.thumbnail}
                      onError={onImgError}
                      alt=""
                      className="h-11 w-11 rounded object-cover shrink-0"
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
                    className="shrink-0 p-2 text-ink-500 hover:text-red-400"
                  >
                    <Icon icon="mdi:close" width={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileNowPlaying;

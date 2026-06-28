import { Icon } from "@iconify/react";
import { usePlayer } from "../../context/PlayerContext";
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { toggleLike } from "../../api/songs";
import { artistName, onImgError } from "../../utils/format";
import ProgressBar from "./ProgressBar";
import VolumeControl from "./VolumeControl";

const PlayerBar = () => {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    next,
    prev,
    progress,
    duration,
    seekTo,
    volume,
    setVolume,
    shuffle,
    toggleShuffle,
    repeat,
    cycleRepeat,
  } = usePlayer();
  const { openAddToPlaylist } = useUI();
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

  return (
    <footer className="h-20 shrink-0 bg-ink-900 border-t border-ink-800 px-3 md:px-4 flex items-center gap-3 md:gap-4">
      {/* Now playing */}
      <div className="flex items-center gap-3 w-1/3 md:w-1/4 min-w-0">
        <img
          src={currentSong.thumbnail}
          onError={onImgError}
          alt=""
          className="h-12 w-12 md:h-14 md:w-14 rounded-md object-cover"
        />
        <div className="min-w-0 hidden xs:block">
          <div className="text-sm text-white truncate">{currentSong.name}</div>
          <div className="text-xs text-ink-500 truncate">
            {artistName(currentSong.artist)}
          </div>
        </div>
        <button
          onClick={onLike}
          aria-label={liked ? "Unlike" : "Like"}
          className={`ml-1 ${liked ? "text-brand" : "text-ink-500 hover:text-white"}`}
        >
          <Icon icon={liked ? "mdi:heart" : "mdi:heart-outline"} width={20} />
        </button>
      </div>

      {/* Controls + progress */}
      <div className="flex-1 flex flex-col items-center gap-1 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 md:gap-5">
          <button
            onClick={toggleShuffle}
            aria-label="Shuffle"
            className={`hidden sm:block ${shuffle ? "text-brand" : "text-ink-500 hover:text-white"}`}
          >
            <Icon icon="mdi:shuffle-variant" width={20} />
          </button>
          <button onClick={prev} aria-label="Previous" className="text-ink-300 hover:text-white">
            <Icon icon="mdi:skip-previous" width={26} />
          </button>
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition"
          >
            <Icon icon={isPlaying ? "mdi:pause" : "mdi:play"} width={24} />
          </button>
          <button onClick={next} aria-label="Next" className="text-ink-300 hover:text-white">
            <Icon icon="mdi:skip-next" width={26} />
          </button>
          <button
            onClick={cycleRepeat}
            aria-label="Repeat"
            className={`hidden sm:block ${repeat !== "off" ? "text-brand" : "text-ink-500 hover:text-white"}`}
          >
            <Icon icon={repeat === "one" ? "mdi:repeat-once" : "mdi:repeat"} width={20} />
          </button>
        </div>
        <ProgressBar progress={progress} duration={duration} onSeek={seekTo} />
      </div>

      {/* Volume / queue */}
      <div className="hidden md:flex items-center justify-end gap-3 w-1/4">
        <button
          onClick={() => openAddToPlaylist(currentSong._id)}
          aria-label="Add to playlist"
          className="text-ink-500 hover:text-white"
        >
          <Icon icon="mdi:playlist-plus" width={22} />
        </button>
        <VolumeControl volume={volume} onChange={setVolume} />
      </div>
    </footer>
  );
};

export default PlayerBar;

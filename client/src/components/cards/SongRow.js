import { Icon } from "@iconify/react";
import { usePlayer } from "../../context/PlayerContext";
import { useUI } from "../../context/UIContext";
import { useToast } from "../../context/ToastContext";
import { artistName, onImgError } from "../../utils/format";

// `onPlay` starts playback (typically playQueue(list, index)).
// `onRemove(song)` is optional - when provided, a trash action is shown
// (used in My Music and in playlists you own).
const SongRow = ({ song, index, onPlay, onRemove }) => {
  const { currentSong, isPlaying, togglePlay, addToQueue } = usePlayer();
  const { openAddToPlaylist } = useUI();
  const toast = useToast();
  const isCurrent = currentSong && currentSong._id === song._id;

  const queueSong = () => {
    addToQueue(song);
    toast.success(`Added “${song.name}” to your queue.`);
  };

  const handlePlay = () => {
    if (isCurrent) togglePlay();
    else onPlay();
  };

  return (
    <div
      className={`group grid grid-cols-[2rem_1fr_auto] items-center gap-3 px-3 py-2 rounded-md hover:bg-ink-700/50 transition ${
        isCurrent ? "bg-ink-700/30" : ""
      }`}
    >
      <div className="w-8 flex items-center justify-center text-ink-500 text-sm">
        <span className={`group-hover:hidden ${isCurrent ? "hidden" : ""}`}>
          {index + 1}
        </span>
        <button
          onClick={handlePlay}
          className={`${isCurrent ? "flex" : "hidden"} group-hover:flex text-white`}
          aria-label={isCurrent && isPlaying ? "Pause" : "Play"}
        >
          <Icon icon={isCurrent && isPlaying ? "mdi:pause" : "mdi:play"} width={20} />
        </button>
      </div>

      <div
        className="flex items-center gap-3 min-w-0 cursor-pointer"
        onClick={handlePlay}
        role="button"
      >
        <img
          src={song.thumbnail}
          onError={onImgError}
          alt=""
          className="h-10 w-10 rounded object-cover"
        />
        <div className="min-w-0">
          <div className={`text-sm truncate ${isCurrent ? "text-brand" : "text-white"}`}>
            {song.name}
          </div>
          <div className="text-xs text-ink-500 truncate">
            {artistName(song.artist)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={queueSong}
          aria-label="Add to queue"
          className="text-ink-500 hover:text-white p-1"
        >
          <Icon icon="mdi:playlist-play" width={20} />
        </button>
        <button
          onClick={() => openAddToPlaylist(song._id)}
          aria-label="Add to playlist"
          className="text-ink-500 hover:text-white p-1"
        >
          <Icon icon="mdi:playlist-plus" width={20} />
        </button>
        {onRemove && (
          <button
            onClick={() => onRemove(song)}
            aria-label="Remove song"
            className="text-ink-500 hover:text-red-400 p-1"
          >
            <Icon icon="mdi:trash-can-outline" width={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SongRow;

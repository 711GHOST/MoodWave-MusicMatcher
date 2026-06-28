import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { usePlayer } from "../../context/PlayerContext";
import { useToast } from "../../context/ToastContext";
import { onImgError } from "../../utils/format";

const PlaylistCard = ({ playlist }) => {
  const navigate = useNavigate();
  const { playPlaylistById } = usePlayer();
  const toast = useToast();

  const open = () => navigate(`/playlist/${playlist._id}`);

  const play = async (e) => {
    e.stopPropagation();
    try {
      const pl = await playPlaylistById(playlist._id);
      if (!pl?.songs?.length) toast.info("This playlist has no songs yet.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div
      onClick={open}
      className="group relative bg-ink-800 hover:bg-ink-700 rounded-xl p-4 cursor-pointer transition"
    >
      <div className="relative mb-3">
        <img
          src={playlist.thumbnail}
          onError={onImgError}
          alt={playlist.name}
          className="w-full aspect-square object-cover rounded-lg shadow-lg"
        />
        <button
          onClick={play}
          aria-label={`Play ${playlist.name}`}
          className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-brand text-black flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition"
        >
          <Icon icon="mdi:play" width={28} />
        </button>
      </div>
      <div className="font-bold text-white truncate">{playlist.name}</div>
      {playlist.emotion ? (
        <div className="text-xs text-brand capitalize mt-0.5">
          {playlist.emotion} mood
        </div>
      ) : (
        playlist.description && (
          <div className="text-xs text-ink-500 truncate mt-0.5">
            {playlist.description}
          </div>
        )
      )}
    </div>
  );
};

export default PlaylistCard;

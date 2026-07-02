import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { usePlayer } from "../../context/PlayerContext";
import { useToast } from "../../context/ToastContext";
import { getAlbumById } from "../../api/albums";
import { onImgError } from "../../utils/format";

const AlbumCard = ({ album }) => {
  const navigate = useNavigate();
  const { playQueue } = usePlayer();
  const toast = useToast();

  const open = () => navigate(`/album/${album._id}`);

  const play = async (e) => {
    e.stopPropagation();
    try {
      const full = await getAlbumById(album._id);
      if (full?.songs?.length) playQueue(full.songs, 0);
      else toast.info("This album has no songs yet.");
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
          src={album.thumbnail}
          onError={onImgError}
          alt={album.title}
          className="w-full aspect-square object-cover rounded-lg shadow-lg"
        />
        <button
          onClick={play}
          aria-label={`Play ${album.title}`}
          className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-brand text-black flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition"
        >
          <Icon icon="mdi:play" width={28} />
        </button>
      </div>
      <div className="font-bold text-white truncate">{album.title}</div>
      <div className="text-xs text-ink-500 truncate mt-0.5 capitalize">
        {album.kind} • {album.artist}
      </div>
    </div>
  );
};

export default AlbumCard;

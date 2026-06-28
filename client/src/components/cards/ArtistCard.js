import { useNavigate } from "react-router-dom";
import { onImgError } from "../../utils/format";

// Artists are derived from the performing-singer string on songs.
const ArtistCard = ({ artist }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/artist/${encodeURIComponent(artist.name)}`)}
      className="group bg-ink-800 hover:bg-ink-700 rounded-xl p-4 text-center cursor-pointer transition"
    >
      <img
        src={artist.thumbnail}
        onError={onImgError}
        alt={artist.name}
        className="w-full aspect-square object-cover rounded-full shadow-lg mb-3"
      />
      <div className="font-bold text-white truncate">{artist.name}</div>
      <div className="text-xs text-ink-500 mt-0.5">
        Artist · {artist.songCount} {artist.songCount === 1 ? "song" : "songs"}
      </div>
    </button>
  );
};

export default ArtistCard;

import { useEffect, useState } from "react";
import Modal from "../components/shared/Modal";
import Spinner from "../components/shared/Spinner";
import EmptyState from "../components/shared/EmptyState";
import { getMyPlaylists, addSongToPlaylist } from "../api/playlists";
import { useToast } from "../context/ToastContext";
import { onImgError } from "../utils/format";

const AddToPlaylistModal = ({ songId, onClose }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    getMyPlaylists()
      .then((res) => setPlaylists(res.data || []))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const add = async (playlistId) => {
    try {
      await addSongToPlaylist(playlistId, songId);
      toast.success("Added to playlist.");
      onClose();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <Modal title="Add to playlist" onClose={onClose}>
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size={28} />
        </div>
      ) : playlists.length === 0 ? (
        <EmptyState
          icon="mdi:playlist-music"
          title="No playlists yet"
          subtitle="Create a playlist first, then add songs to it."
        />
      ) : (
        <div className="space-y-1 max-h-80 overflow-auto">
          {playlists.map((p) => (
            <button
              key={p._id}
              onClick={() => add(p._id)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-ink-700 transition text-left"
            >
              <img
                src={p.thumbnail}
                onError={onImgError}
                alt=""
                className="h-11 w-11 rounded object-cover"
              />
              <span className="text-sm text-white font-semibold truncate">
                {p.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default AddToPlaylistModal;

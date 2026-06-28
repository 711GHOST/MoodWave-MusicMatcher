import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMySongs, deleteSong } from "../api/songs";
import { usePlayer } from "../context/PlayerContext";
import { useToast } from "../context/ToastContext";
import SongRow from "../components/cards/SongRow";
import Spinner from "../components/shared/Spinner";
import EmptyState from "../components/shared/EmptyState";

const MyMusic = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playQueue } = usePlayer();
  const toast = useToast();

  useEffect(() => {
    getMySongs()
      .then((r) => setSongs(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (song) => {
    try {
      await deleteSong(song._id);
      setSongs((prev) => prev.filter((s) => s._id !== song._id));
      toast.success("Song deleted.");
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="pt-6">
      <h1 className="text-3xl font-extrabold text-white mb-6">My Music</h1>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={36} />
        </div>
      ) : songs.length === 0 ? (
        <EmptyState
          icon="mdi:cloud-upload-outline"
          title="You haven't uploaded any songs"
          subtitle="Upload a track and it will show up here."
          action={
            <Link
              to="/upload"
              className="bg-brand hover:bg-brand-light text-black font-bold px-6 py-3 rounded-full transition"
            >
              Upload a song
            </Link>
          }
        />
      ) : (
        <div className="space-y-1">
          {songs.map((s, i) => (
            <SongRow
              key={s._id}
              song={s}
              index={i}
              onPlay={() => playQueue(songs, i)}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyMusic;

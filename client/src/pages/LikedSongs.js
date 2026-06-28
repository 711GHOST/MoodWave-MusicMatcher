import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { getLikedSongs } from "../api/songs";
import { usePlayer } from "../context/PlayerContext";
import SongRow from "../components/cards/SongRow";
import Spinner from "../components/shared/Spinner";
import EmptyState from "../components/shared/EmptyState";

const LikedSongs = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playQueue } = usePlayer();

  useEffect(() => {
    getLikedSongs()
      .then((r) => setSongs(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-6">
      <div className="flex items-end gap-5 mb-8 rounded-2xl p-6 bg-gradient-to-br from-accent/50 to-ink-850">
        <div className="w-28 h-28 rounded-lg bg-gradient-to-br from-accent to-brand flex items-center justify-center shadow-xl">
          <Icon icon="mdi:heart" width={56} className="text-white" />
        </div>
        <div>
          <div className="text-xs font-semibold text-white/80 uppercase tracking-wide">
            Playlist
          </div>
          <h1 className="text-4xl font-extrabold text-white">Liked Songs</h1>
          <div className="text-sm text-white/80 mt-2">
            {songs.length} {songs.length === 1 ? "song" : "songs"}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={36} />
        </div>
      ) : songs.length === 0 ? (
        <EmptyState
          icon="mdi:heart-outline"
          title="Songs you like will appear here"
          subtitle="Tap the heart on any song to save it to your Liked Songs."
        />
      ) : (
        <div className="space-y-1">
          {songs.map((s, i) => (
            <SongRow
              key={s._id}
              song={s}
              index={i}
              onPlay={() => playQueue(songs, i)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedSongs;

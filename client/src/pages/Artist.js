import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { getSongsByArtist } from "../api/songs";
import { usePlayer } from "../context/PlayerContext";
import { onImgError } from "../utils/format";
import SongRow from "../components/cards/SongRow";
import Spinner from "../components/shared/Spinner";
import EmptyState from "../components/shared/EmptyState";

const Artist = () => {
  const { name } = useParams();
  const artist = decodeURIComponent(name || "");
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playQueue } = usePlayer();

  useEffect(() => {
    setLoading(true);
    getSongsByArtist(artist)
      .then((r) => setSongs(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [artist]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={36} />
      </div>
    );
  }

  return (
    <div className="pt-6">
      <div className="flex items-end gap-6 mb-8">
        <img
          src={songs[0]?.thumbnail}
          onError={onImgError}
          alt={artist}
          className="w-36 h-36 rounded-full object-cover shadow-2xl bg-ink-800"
        />
        <div>
          <div className="text-xs font-semibold text-white/70 uppercase tracking-wide">
            Artist
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white">{artist}</h1>
          <div className="text-sm text-ink-400 mt-2">
            {songs.length} {songs.length === 1 ? "song" : "songs"}
          </div>
        </div>
      </div>

      {songs.length === 0 ? (
        <EmptyState
          icon="mdi:account-music-outline"
          title="No songs found"
          subtitle={`We couldn't find any tracks by ${artist}.`}
        />
      ) : (
        <>
          <button
            onClick={() => playQueue(songs, 0)}
            className="flex items-center gap-2 bg-brand hover:bg-brand-light text-black font-bold px-6 py-3 rounded-full transition mb-6"
          >
            <Icon icon="mdi:play" width={22} /> Play all
          </button>
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
        </>
      )}
    </div>
  );
};

export default Artist;

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { getAlbumById, deleteAlbum, removeSongFromAlbum } from "../api/albums";
import { usePlayer } from "../context/PlayerContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { onImgError } from "../utils/format";
import SongRow from "../components/cards/SongRow";
import Spinner from "../components/shared/Spinner";
import EmptyState from "../components/shared/EmptyState";

const Album = () => {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const { playQueue, currentSong, isPlaying, togglePlay } = usePlayer();

  useEffect(() => {
    setLoading(true);
    getAlbumById(albumId)
      .then(setAlbum)
      .catch(() => setAlbum(null))
      .finally(() => setLoading(false));
  }, [albumId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={36} />
      </div>
    );
  }
  if (!album) {
    return (
      <div className="pt-10">
        <EmptyState
          icon="mdi:album"
          title="Album not found"
          subtitle="It may have been removed."
        />
      </div>
    );
  }

  const songs = album.songs || [];
  const ownerId = album.owner?._id || album.owner;
  const isOwner = user && ownerId === user._id;
  const playingThis =
    currentSong && songs.some((s) => s._id === currentSong._id);

  const onBigPlay = () => {
    if (playingThis) togglePlay();
    else if (songs.length) playQueue(songs, 0);
  };

  const handleDelete = async () => {
    try {
      await deleteAlbum(album._id);
      toast.success("Album deleted.");
      navigate("/library");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleRemoveSong = async (song) => {
    try {
      const updated = await removeSongFromAlbum(album._id, song._id);
      setAlbum((prev) => ({ ...prev, songs: updated.songs }));
      toast.success("Removed from album.");
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="pt-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-8">
        <img
          src={album.thumbnail}
          onError={onImgError}
          alt={album.title}
          className="w-44 h-44 rounded-xl object-cover shadow-2xl"
        />
        <div className="text-center sm:text-left">
          <div className="text-xs font-semibold text-white/70 uppercase tracking-wide">
            Album
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white my-2">
            {album.title}
          </h1>
          <div className="text-sm text-ink-400 capitalize">
            {album.kind} • {album.artist}
            {album.year ? ` • ${album.year}` : ""} • {songs.length}{" "}
            {songs.length === 1 ? "song" : "songs"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        {songs.length > 0 && (
          <button
            onClick={onBigPlay}
            className="w-14 h-14 rounded-full bg-brand text-black flex items-center justify-center shadow-xl hover:scale-105 transition"
            aria-label={playingThis && isPlaying ? "Pause album" : "Play album"}
          >
            <Icon
              icon={playingThis && isPlaying ? "mdi:pause" : "mdi:play"}
              width={32}
            />
          </button>
        )}
        {isOwner && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 text-sm font-semibold text-ink-400 hover:text-red-400 transition"
          >
            <Icon icon="mdi:trash-can-outline" width={20} /> Delete album
          </button>
        )}
      </div>

      {songs.length === 0 ? (
        <EmptyState
          icon="mdi:music-note-off"
          title="This album is empty"
          subtitle="Add songs to it from your library."
        />
      ) : (
        <div className="space-y-1">
          {songs.map((s, i) => (
            <SongRow
              key={s._id}
              song={s}
              index={i}
              onPlay={() => playQueue(songs, i)}
              onRemove={isOwner ? handleRemoveSong : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Album;

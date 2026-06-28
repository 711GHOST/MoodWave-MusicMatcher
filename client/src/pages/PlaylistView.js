import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import {
  getPlaylistById,
  deletePlaylist,
  removeSongFromPlaylist,
} from "../api/playlists";
import { usePlayer } from "../context/PlayerContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { artistName, onImgError } from "../utils/format";
import SongRow from "../components/cards/SongRow";
import Spinner from "../components/shared/Spinner";
import EmptyState from "../components/shared/EmptyState";

const PlaylistView = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const { playQueue, currentSong, isPlaying, togglePlay } = usePlayer();

  useEffect(() => {
    setLoading(true);
    getPlaylistById(playlistId)
      .then(setPlaylist)
      .catch(() => setPlaylist(null))
      .finally(() => setLoading(false));
  }, [playlistId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={36} />
      </div>
    );
  }
  if (!playlist) {
    return (
      <div className="pt-10">
        <EmptyState
          icon="mdi:playlist-remove"
          title="Playlist not found"
          subtitle="It may have been removed."
        />
      </div>
    );
  }

  const songs = playlist.songs || [];
  const ownerId = playlist.owner?._id || playlist.owner;
  const isOwner = user && ownerId === user._id;
  const playingThis =
    currentSong && songs.some((s) => s._id === currentSong._id);

  const onBigPlay = () => {
    if (playingThis) togglePlay();
    else if (songs.length) playQueue(songs, 0);
  };

  const handleDeletePlaylist = async () => {
    try {
      await deletePlaylist(playlist._id);
      toast.success("Playlist deleted.");
      navigate("/library");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleRemoveSong = async (song) => {
    try {
      const updated = await removeSongFromPlaylist(playlist._id, song._id);
      // Keep the populated owner; just swap the songs array.
      setPlaylist((prev) => ({ ...prev, songs: updated.songs }));
      toast.success("Removed from playlist.");
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="pt-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-8">
        <img
          src={playlist.thumbnail}
          onError={onImgError}
          alt={playlist.name}
          className="w-44 h-44 rounded-xl object-cover shadow-2xl"
        />
        <div className="text-center sm:text-left">
          <div className="text-xs font-semibold text-white/70 uppercase tracking-wide">
            {playlist.emotion ? `${playlist.emotion} mood` : "Playlist"}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white my-2">
            {playlist.name}
          </h1>
          <div className="text-sm text-ink-400">
            {artistName(playlist.owner)} • {songs.length}{" "}
            {songs.length === 1 ? "song" : "songs"}
          </div>
        </div>
      </div>

      {(songs.length > 0 || isOwner) && (
        <div className="flex items-center gap-4 mb-6">
          {songs.length > 0 && (
            <button
              onClick={onBigPlay}
              className="w-14 h-14 rounded-full bg-brand text-black flex items-center justify-center shadow-xl hover:scale-105 transition"
              aria-label={playingThis && isPlaying ? "Pause playlist" : "Play playlist"}
            >
              <Icon
                icon={playingThis && isPlaying ? "mdi:pause" : "mdi:play"}
                width={32}
              />
            </button>
          )}
          {isOwner && (
            <button
              onClick={handleDeletePlaylist}
              className="flex items-center gap-1 text-sm font-semibold text-ink-400 hover:text-red-400 transition"
            >
              <Icon icon="mdi:trash-can-outline" width={20} /> Delete playlist
            </button>
          )}
        </div>
      )}

      {songs.length === 0 ? (
        <EmptyState
          icon="mdi:music-note-off"
          title="This playlist is empty"
          subtitle="Add songs from search or the player's add-to-playlist button."
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

export default PlaylistView;

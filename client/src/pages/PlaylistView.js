import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import {
  getPlaylistById,
  deletePlaylist,
  removeSongFromPlaylist,
  toggleLikePlaylist,
  addCollaborator,
  removeCollaborator,
} from "../api/playlists";
import { usePlayer } from "../context/PlayerContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { artistName, onImgError } from "../utils/format";
import SongRow from "../components/cards/SongRow";
import Spinner from "../components/shared/Spinner";
import EmptyState from "../components/shared/EmptyState";

const fullName = (u) =>
  [u?.firstName, u?.lastName].filter(Boolean).join(" ") || u?.userName || "User";

const PlaylistView = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collabInput, setCollabInput] = useState("");
  const [addingCollab, setAddingCollab] = useState(false);
  const [liking, setLiking] = useState(false);
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
  const collaborators = playlist.collaborators || [];
  const ownerId = playlist.owner?._id || playlist.owner;
  const isOwner = user && ownerId === user._id;
  const liked = (user?.likedPlaylists || []).some(
    (id) => (id._id || id) === playlist._id
  );
  const playingThis =
    currentSong && songs.some((s) => s._id === currentSong._id);

  const onBigPlay = () => {
    if (playingThis) togglePlay();
    else if (songs.length) playQueue(songs, 0);
  };

  const onToggleLike = async () => {
    setLiking(true);
    try {
      const res = await toggleLikePlaylist(playlist._id);
      await refreshUser();
      toast.success(res.liked ? "Added to your library." : "Removed from your library.");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLiking(false);
    }
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
      setPlaylist((prev) => ({ ...prev, songs: updated.songs }));
      toast.success("Removed from playlist.");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    if (!collabInput.trim()) return;
    setAddingCollab(true);
    try {
      const updated = await addCollaborator(playlist._id, collabInput.trim());
      setPlaylist((prev) => ({ ...prev, collaborators: updated.collaborators }));
      setCollabInput("");
      toast.success("Collaborator added.");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setAddingCollab(false);
    }
  };

  const handleRemoveCollaborator = async (userId) => {
    try {
      const updated = await removeCollaborator(playlist._id, userId);
      setPlaylist((prev) => ({ ...prev, collaborators: updated.collaborators }));
      toast.success("Collaborator removed.");
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
            {collaborators.length > 0 &&
              ` • ${collaborators.length} collaborator${
                collaborators.length === 1 ? "" : "s"
              }`}
          </div>
        </div>
      </div>

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
        <button
          onClick={onToggleLike}
          disabled={liking}
          aria-label={liked ? "Remove from your library" : "Save to your library"}
          className={`transition disabled:opacity-50 ${
            liked ? "text-brand" : "text-ink-400 hover:text-white"
          }`}
        >
          <Icon icon={liked ? "mdi:heart" : "mdi:heart-outline"} width={32} />
        </button>
        {isOwner && (
          <button
            onClick={handleDeletePlaylist}
            className="flex items-center gap-1 text-sm font-semibold text-ink-400 hover:text-red-400 transition"
          >
            <Icon icon="mdi:trash-can-outline" width={20} /> Delete playlist
          </button>
        )}
      </div>

      {/* Collaborators */}
      {(isOwner || collaborators.length > 0) && (
        <div className="mb-8 bg-ink-850 border border-ink-800 rounded-2xl p-5 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Icon icon="mdi:account-multiple" width={20} className="text-ink-300" />
            <h2 className="font-bold text-white">Collaborators</h2>
          </div>

          {collaborators.length === 0 ? (
            <p className="text-sm text-ink-500 mb-3">
              No collaborators yet. Add people to let them edit this playlist.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-3">
              {collaborators.map((c) => (
                <span
                  key={c._id}
                  className="flex items-center gap-2 bg-ink-700 rounded-full pl-1 pr-2 py-1"
                >
                  <span className="w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
                    {(c.firstName?.[0] || c.userName?.[0] || "U").toUpperCase()}
                  </span>
                  <span className="text-sm text-white">{fullName(c)}</span>
                  {isOwner && (
                    <button
                      onClick={() => handleRemoveCollaborator(c._id)}
                      aria-label={`Remove ${fullName(c)}`}
                      className="text-ink-400 hover:text-red-400"
                    >
                      <Icon icon="mdi:close" width={16} />
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}

          {isOwner && (
            <form onSubmit={handleAddCollaborator} className="flex gap-2">
              <input
                value={collabInput}
                onChange={(e) => setCollabInput(e.target.value)}
                placeholder="Add by username or email"
                className="flex-1 px-4 py-2 rounded-lg bg-ink-800 border border-ink-700 text-sm text-white placeholder-ink-500 focus:outline-none focus:border-brand"
              />
              <button
                type="submit"
                disabled={addingCollab}
                className="bg-ink-700 hover:bg-ink-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-60"
              >
                {addingCollab ? "Adding…" : "Add"}
              </button>
            </form>
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

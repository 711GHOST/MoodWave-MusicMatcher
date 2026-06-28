import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { getMyPlaylists } from "../api/playlists";
import { useUI } from "../context/UIContext";
import { useLanguage } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import PlaylistCard from "../components/cards/PlaylistCard";
import Spinner from "../components/shared/Spinner";
import EmptyState from "../components/shared/EmptyState";

const Library = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const { openCreatePlaylist } = useUI();
  const { t } = useLanguage();
  const { settings } = useSettings();

  // "Use compact library layout" packs more playlists per row with tighter gaps.
  const gridClass = settings.compactLibrary
    ? "grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3"
    : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4";

  useEffect(() => {
    getMyPlaylists()
      .then((r) => setPlaylists(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-white">
          {t("yourLibrary")}
        </h1>
        <button
          onClick={openCreatePlaylist}
          className="flex items-center gap-2 bg-ink-700 hover:bg-ink-600 text-white font-semibold px-4 py-2 rounded-full transition"
        >
          <Icon icon="mdi:plus" width={20} /> Create
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={36} />
        </div>
      ) : playlists.length === 0 ? (
        <EmptyState
          icon="mdi:playlist-music"
          title="No playlists yet"
          subtitle="Create your first playlist to see it here."
        />
      ) : (
        <div className={gridClass}>
          {playlists.map((p) => (
            <PlaylistCard key={p._id} playlist={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Library;

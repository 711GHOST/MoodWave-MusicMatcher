import { useState } from "react";
import { Icon } from "@iconify/react";
import { searchSongs } from "../api/songs";
import { useLanguage } from "../context/LanguageContext";
import { usePlayer } from "../context/PlayerContext";
import SongRow from "../components/cards/SongRow";
import EmptyState from "../components/shared/EmptyState";
import Spinner from "../components/shared/Spinner";

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const { playQueue } = usePlayer();

  const run = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const r = await searchSongs(query.trim());
      setResults(r.data || []);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-6">
      <div className="relative max-w-xl mb-8">
        <Icon
          icon="mdi:magnify"
          width={22}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder={t("searchPlaceholder")}
          className="w-full pl-12 pr-4 py-3 rounded-full bg-ink-800 border border-ink-700 text-white placeholder-ink-500 focus:outline-none focus:border-brand"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={32} />
        </div>
      ) : results.length > 0 ? (
        <div>
          <h2 className="text-lg font-bold text-white mb-3">
            Results for “{query}”
          </h2>
          <div className="space-y-1">
            {results.map((s, i) => (
              <SongRow
                key={s._id}
                song={s}
                index={i}
                onPlay={() => playQueue(results, i)}
              />
            ))}
          </div>
        </div>
      ) : searched ? (
        <EmptyState
          icon="mdi:music-note-off"
          title="No songs found"
          subtitle={`We couldn't find anything for “${query}”.`}
        />
      ) : (
        <EmptyState
          icon="mdi:magnify"
          title="Search Moodwave"
          subtitle="Find songs by name and play them instantly."
        />
      )}
    </div>
  );
};

export default Search;

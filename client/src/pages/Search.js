import { useCallback, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { searchAll } from "../api/search";
import { searchSongs } from "../api/songs";
import { usePlayer } from "../context/PlayerContext";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import {
  getRecentSearches,
  pushRecentSearch,
  clearRecentSearches,
} from "../utils/recentSearches";
import SongRow from "../components/cards/SongRow";
import PlaylistCard from "../components/cards/PlaylistCard";
import ArtistCard from "../components/cards/ArtistCard";
import EmptyState from "../components/shared/EmptyState";
import Spinner from "../components/shared/Spinner";

const SONG_PAGE_SIZE = 10;

const Search = () => {
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [artists, setArtists] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("all");
  const [songsPage, setSongsPage] = useState(1);
  const [songsHasMore, setSongsHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeQuery, setActiveQuery] = useState("");
  const [recent, setRecent] = useState(() => getRecentSearches());
  const { playQueue } = usePlayer();

  // `commit` saves the term to recent searches (explicit submit / chip click).
  const run = useCallback(async (term, commit) => {
    const q = (term || "").trim();
    if (!q) return;
    setLoading(true);
    try {
      const r = await searchAll(q);
      setSongs(r.songs || []);
      setPlaylists(r.playlists || []);
      setArtists(r.artists || []);
      setSongsHasMore(!!r.songsHasMore);
      setSongsPage(1);
      setActiveQuery(q);
      setSearched(true);
      setTab("all");
      if (commit) setRecent(pushRecentSearch(q));
    } finally {
      setLoading(false);
    }
  }, []);

  // Live search: debounce typing (≥2 chars) so results update as you type.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return undefined;
    const id = setTimeout(() => run(q, false), 350);
    return () => clearTimeout(id);
  }, [query, run]);

  const onChangeQuery = (v) => {
    setQuery(v);
    if (v.trim() === "") setSearched(false); // back to the recent-searches view
  };

  const submit = () => {
    const q = query.trim();
    if (q) run(q, true);
  };

  const chooseRecent = (term) => {
    setQuery(term);
    run(term, true);
  };

  const loadMoreSongs = useCallback(async () => {
    if (loadingMore || !songsHasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = songsPage + 1;
      const r = await searchSongs(activeQuery, nextPage, SONG_PAGE_SIZE);
      setSongs((prev) => [...prev, ...(r.data || [])]);
      setSongsPage(nextPage);
      setSongsHasMore(!!r.hasMore);
    } finally {
      setLoadingMore(false);
    }
  }, [activeQuery, songsPage, songsHasMore, loadingMore]);

  const sentinelRef = useInfiniteScroll(loadMoreSongs, {
    hasMore: songsHasMore,
    loading: loadingMore,
  });

  const total = songs.length + playlists.length + artists.length;
  const TABS = [
    { id: "all", label: "All" },
    { id: "songs", label: "Songs", count: songs.length },
    { id: "playlists", label: "Playlists", count: playlists.length },
    { id: "artists", label: "Artists", count: artists.length },
  ];

  const showSongs = tab === "all" || tab === "songs";
  const showPlaylists = tab === "all" || tab === "playlists";
  const showArtists = tab === "all" || tab === "artists";

  const Section = ({ title, children }) => (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-white mb-3">{title}</h2>
      {children}
    </section>
  );

  return (
    <div className="pt-6">
      <div className="relative max-w-xl mb-6">
        <Icon
          icon="mdi:magnify"
          width={22}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500"
        />
        <input
          value={query}
          onChange={(e) => onChangeQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Songs, playlists, or artists"
          className="w-full pl-12 pr-4 py-3 rounded-full bg-ink-800 border border-ink-700 text-white placeholder-ink-500 focus:outline-none focus:border-brand"
        />
      </div>

      {searched && total > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.filter((tb) => tb.id === "all" || tb.count > 0).map((tb) => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                tab === tb.id
                  ? "bg-white text-black"
                  : "bg-ink-800 text-ink-300 hover:bg-ink-700"
              }`}
            >
              {tb.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={32} />
        </div>
      ) : !searched ? (
        recent.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-white">Recent searches</h2>
              <button
                onClick={() => {
                  clearRecentSearches();
                  setRecent([]);
                }}
                className="text-xs font-semibold text-ink-400 hover:text-white"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recent.map((term) => (
                <button
                  key={term}
                  onClick={() => chooseRecent(term)}
                  className="flex items-center gap-2 bg-ink-800 hover:bg-ink-700 text-ink-200 text-sm rounded-full pl-3 pr-4 py-2 transition"
                >
                  <Icon icon="mdi:history" width={16} className="text-ink-500" />
                  {term}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            icon="mdi:magnify"
            title="Search Moodwave"
            subtitle="Find songs, playlists, and artists - then play them instantly."
          />
        )
      ) : total === 0 ? (
        <EmptyState
          icon="mdi:music-note-off"
          title="No results found"
          subtitle={`We couldn't find anything for “${query}”.`}
        />
      ) : (
        <div>
          {showArtists && artists.length > 0 && (
            <Section title="Artists">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {artists.map((a) => (
                  <ArtistCard key={a.name} artist={a} />
                ))}
              </div>
            </Section>
          )}

          {showSongs && songs.length > 0 && (
            <Section title="Songs">
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

              {songsHasMore && (
                <div ref={sentinelRef} className="flex justify-center py-6">
                  {loadingMore ? (
                    <Spinner size={24} />
                  ) : (
                    <button
                      onClick={loadMoreSongs}
                      className="text-sm font-semibold text-ink-300 hover:text-white border border-ink-700 hover:border-ink-500 rounded-full px-5 py-2 transition"
                    >
                      Load more songs
                    </button>
                  )}
                </div>
              )}
            </Section>
          )}

          {showPlaylists && playlists.length > 0 && (
            <Section title="Playlists">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {playlists.map((p) => (
                  <PlaylistCard key={p._id} playlist={p} />
                ))}
              </div>
            </Section>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;

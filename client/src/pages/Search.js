import { useState } from "react";
import { Icon } from "@iconify/react";
import { searchAll } from "../api/search";
import { usePlayer } from "../context/PlayerContext";
import SongRow from "../components/cards/SongRow";
import PlaylistCard from "../components/cards/PlaylistCard";
import ArtistCard from "../components/cards/ArtistCard";
import EmptyState from "../components/shared/EmptyState";
import Spinner from "../components/shared/Spinner";

const EMPTY = { songs: [], playlists: [], artists: [] };

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(EMPTY);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("all");
  const { playQueue } = usePlayer();

  const run = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const r = await searchAll(query.trim());
      setResults({
        songs: r.songs || [],
        playlists: r.playlists || [],
        artists: r.artists || [],
      });
      setSearched(true);
      setTab("all");
    } finally {
      setLoading(false);
    }
  };

  const { songs, playlists, artists } = results;
  const total = songs.length + playlists.length + artists.length;

  const TABS = [
    { id: "all", label: "All", count: total },
    { id: "songs", label: "Songs", count: songs.length },
    { id: "playlists", label: "Playlists", count: playlists.length },
    { id: "artists", label: "Artists", count: artists.length },
  ];

  const showSongs = tab === "all" || tab === "songs";
  const showPlaylists = tab === "all" || tab === "playlists";
  const showArtists = tab === "all" || tab === "artists";

  const SongList = () => (
    <div className="space-y-1">
      {songs.map((s, i) => (
        <SongRow key={s._id} song={s} index={i} onPlay={() => playQueue(songs, i)} />
      ))}
    </div>
  );

  const PlaylistGrid = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {playlists.map((p) => (
        <PlaylistCard key={p._id} playlist={p} />
      ))}
    </div>
  );

  const ArtistGrid = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {artists.map((a) => (
        <ArtistCard key={a.name} artist={a} />
      ))}
    </div>
  );

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
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Songs, playlists, or artists"
          className="w-full pl-12 pr-4 py-3 rounded-full bg-ink-800 border border-ink-700 text-white placeholder-ink-500 focus:outline-none focus:border-brand"
        />
      </div>

      {searched && total > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.filter((tb) => tb.count > 0 || tb.id === "all").map((tb) => (
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
        <EmptyState
          icon="mdi:magnify"
          title="Search Moodwave"
          subtitle="Find songs, playlists, and artists — then play them instantly."
        />
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
              <ArtistGrid />
            </Section>
          )}
          {showSongs && songs.length > 0 && (
            <Section title="Songs">
              <SongList />
            </Section>
          )}
          {showPlaylists && playlists.length > 0 && (
            <Section title="Playlists">
              <PlaylistGrid />
            </Section>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;

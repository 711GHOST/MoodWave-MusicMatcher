import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { getFeaturedPlaylists } from "../api/playlists";
import { getFeaturedAlbums } from "../api/albums";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { usePlayer } from "../context/PlayerContext";
import { greetingKey, artistName, onImgError } from "../utils/format";
import {
  getRecentlyPlayed,
  clearRecentlyPlayed,
  RECENTLY_PLAYED_EVENT,
} from "../utils/recentlyPlayed";
import PlaylistCard from "../components/cards/PlaylistCard";
import AlbumCard from "../components/cards/AlbumCard";
import Spinner from "../components/shared/Spinner";
import EmptyState from "../components/shared/EmptyState";

const Section = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {children}
    </div>
  </section>
);

const Home = () => {
  const [playlists, setPlaylists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState(() => getRecentlyPlayed());
  const { user } = useAuth();
  const { t } = useLanguage();
  const { playQueue } = usePlayer();

  useEffect(() => {
    Promise.all([getFeaturedPlaylists(), getFeaturedAlbums()])
      .then(([pl, al]) => {
        setPlaylists(pl.data || []);
        setAlbums(al.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Keep the "Recently played" shelf in sync as tracks start.
  useEffect(() => {
    const refresh = () => setRecent(getRecentlyPlayed());
    window.addEventListener(RECENTLY_PLAYED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(RECENTLY_PLAYED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const moods = playlists.filter((p) => p.emotion);
  const featured = playlists.filter((p) => !p.emotion);

  return (
    <div className="pt-4">
      <h1 className="text-3xl font-extrabold text-white mb-8 mt-2">
        {t(greetingKey())}
        {user ? `, ${user.firstName}` : ""}
      </h1>

      <Link
        to="/mood"
        className="block mb-10 rounded-2xl p-6 md:p-8 bg-gradient-to-r from-accent/30 via-brand/20 to-ink-800 border border-ink-800 hover:border-brand transition"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-brand font-semibold mb-1">Mood mode</div>
            <div className="text-xl md:text-2xl font-bold text-white">
              Not sure what to play? Let your mood decide.
            </div>
            <div className="text-ink-300 text-sm mt-1">
              Scan your face or pick how you feel for a tailored playlist.
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-brand text-black font-bold px-5 py-3 rounded-full shrink-0">
            <Icon icon="mdi:emoticon-happy" width={22} /> Check my mood
          </div>
        </div>
      </Link>

      {recent.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Recently played</h2>
            <button
              onClick={() => {
                clearRecentlyPlayed();
                setRecent([]);
              }}
              className="text-xs font-semibold text-ink-400 hover:text-white"
            >
              Clear
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 mw-no-scrollbar">
            {recent.map((song, i) => (
              <button
                key={song._id}
                onClick={() => playQueue(recent, i)}
                className="group w-36 shrink-0 text-left bg-ink-800 hover:bg-ink-700 rounded-xl p-3 transition"
              >
                <div className="relative mb-2">
                  <img
                    src={song.thumbnail}
                    onError={onImgError}
                    alt=""
                    className="w-full aspect-square object-cover rounded-lg shadow-lg"
                  />
                  <span className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-brand text-black flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition">
                    <Icon icon="mdi:play" width={24} />
                  </span>
                </div>
                <div className="text-sm text-white truncate">{song.name}</div>
                <div className="text-xs text-ink-500 truncate">
                  {artistName(song.artist)}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={36} />
        </div>
      ) : playlists.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          subtitle="Create a playlist or check your mood to get started."
        />
      ) : (
        <>
          {moods.length > 0 && (
            <Section title={t("madeForMoods")}>
              {moods.map((p) => (
                <PlaylistCard key={p._id} playlist={p} />
              ))}
            </Section>
          )}
          {featured.length > 0 && (
            <Section title={t("featured")}>
              {featured.map((p) => (
                <PlaylistCard key={p._id} playlist={p} />
              ))}
            </Section>
          )}
          {albums.length > 0 && (
            <Section title="Albums">
              {albums.map((a) => (
                <AlbumCard key={a._id} album={a} />
              ))}
            </Section>
          )}
        </>
      )}
    </div>
  );
};

export default Home;

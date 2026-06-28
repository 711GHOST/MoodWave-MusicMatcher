import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { getFeaturedPlaylists } from "../api/playlists";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { greetingKey } from "../utils/format";
import PlaylistCard from "../components/cards/PlaylistCard";
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
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    getFeaturedPlaylists()
      .then((r) => setPlaylists(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
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
        </>
      )}
    </div>
  );
};

export default Home;

import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import Brand from "../components/shared/Brand";

const MOODS = ["😊", "😢", "😠", "😌", "😲", "🥳"];

const Landing = () => (
  <div className="min-h-full w-full bg-ink-950 text-white overflow-auto">
    {/* Header */}
    <header className="flex items-center justify-between px-6 md:px-12 py-5">
      <Brand iconSize={34} />
      <div className="flex items-center gap-3 md:gap-5">
        <Link
          to="/login"
          className="text-sm font-semibold text-ink-400 hover:text-white"
        >
          Log in
        </Link>
        <Link
          to="/signup"
          className="bg-brand hover:bg-brand-light text-black font-bold text-sm px-5 py-2.5 rounded-full transition"
        >
          Sign up free
        </Link>
      </div>
    </header>

    {/* Hero */}
    <section className="relative px-6 md:px-12 pt-16 pb-24 max-w-5xl mx-auto text-center">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/20 via-brand/5 to-transparent blur-3xl" />
      <div className="flex justify-center gap-2 mb-6 text-3xl">
        {MOODS.map((m, i) => (
          <span
            key={i}
            className="animate-fade-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {m}
          </span>
        ))}
      </div>
      <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
        Music that matches{" "}
        <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
          your mood
        </span>
      </h1>
      <p className="mt-6 text-lg text-ink-400 max-w-2xl mx-auto">
        Moodwave reads how you feel — with a quick camera scan or a tap — and
        cues up the perfect playlist for the moment. Stream, build playlists,
        and let your emotions pick the soundtrack.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/signup"
          className="bg-brand hover:bg-brand-light text-black font-bold px-8 py-4 rounded-full transition flex items-center gap-2"
        >
          <Icon icon="mdi:rocket-launch" width={22} /> Get started — it's free
        </Link>
        <Link
          to="/login"
          className="border border-ink-600 hover:border-white text-white font-semibold px-8 py-4 rounded-full transition"
        >
          I already have an account
        </Link>
      </div>
      <p className="mt-6 text-xs text-ink-500">
        Try the demo account — email{" "}
        <span className="text-ink-300">demo@moodwave.app</span> / password{" "}
        <span className="text-ink-300">Demo@1234</span>
      </p>
    </section>

    {/* Feature strip */}
    <section className="px-6 md:px-12 pb-20 max-w-5xl mx-auto grid sm:grid-cols-3 gap-6">
      {[
        {
          icon: "mdi:face-recognition",
          title: "Mood detection",
          text: "A private, in-browser camera scan reads your expression.",
        },
        {
          icon: "mdi:playlist-music",
          title: "Smart playlists",
          text: "Curated mixes for every feeling, plus build your own.",
        },
        {
          icon: "mdi:music-circle",
          title: "Full player",
          text: "Queue, shuffle, repeat, seek and volume — all the essentials.",
        },
      ].map((f) => (
        <div
          key={f.title}
          className="bg-ink-850 border border-ink-800 rounded-2xl p-6"
        >
          <Icon icon={f.icon} width={32} className="text-brand mb-3" />
          <h3 className="font-bold text-lg">{f.title}</h3>
          <p className="text-sm text-ink-400 mt-1">{f.text}</p>
        </div>
      ))}
    </section>
  </div>
);

export default Landing;

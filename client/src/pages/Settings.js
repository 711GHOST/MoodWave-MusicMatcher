import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useSettings, QUALITY_OPTIONS } from "../context/SettingsContext";
import { useLanguage } from "../context/LanguageContext";
import { useUI } from "../context/UIContext";
import { useToast } from "../context/ToastContext";
import Toggle from "../components/shared/Toggle";
import Select from "../components/shared/Select";
import Equalizer from "../components/settings/Equalizer";

const SettingRow = ({ label, desc, children }) => (
  <div className="flex items-start justify-between gap-6 py-3">
    <div className="min-w-0">
      <div className="text-white">{label}</div>
      {desc && <div className="text-sm text-ink-400 mt-0.5">{desc}</div>}
    </div>
    <div className="shrink-0 pt-0.5">{children}</div>
  </div>
);

const Section = ({ title, children, info }) => (
  <section className="mb-8">
    <h2 className="text-xl font-extrabold text-white mb-1">{title}</h2>
    {info && (
      <div className="flex items-center gap-2 text-xs text-ink-300 mb-1">
        <Icon icon="mdi:information-outline" width={16} />
        {info}
      </div>
    )}
    <div className="divide-y divide-ink-800/70">{children}</div>
  </section>
);

const Settings = () => {
  const { settings, setSetting } = useSettings();
  const { language } = useLanguage();
  const { openLanguage } = useUI();
  const toast = useToast();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  // Lightweight section-level search: a section shows if its keywords match.
  const show = (...keywords) =>
    !q || keywords.some((k) => k.toLowerCase().includes(q));

  const matched = useMemo(
    () => ({
      account: show("account", "login", "edit login methods", "password"),
      language: show("language", "translate"),
      audio: show("audio quality", "streaming", "normalize volume"),
      library: show("your library", "compact", "import music"),
      display: show("display", "now-playing panel"),
      videos: show("videos", "canvas", "other videos"),
      playback: show("playback", "equalizer", "fine-tune"),
      activity: show("listening activity", "insights"),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q]
  );
  const anyMatch = Object.values(matched).some(Boolean);

  return (
    <div className="pt-6 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-extrabold text-white">Settings</h1>
        <div className="relative w-44 sm:w-56">
          <Icon
            icon="mdi:magnify"
            width={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search settings"
            className="w-full pl-10 pr-3 py-2 rounded-full bg-ink-800 border border-ink-700 text-sm text-white placeholder-ink-500 focus:outline-none focus:border-brand"
          />
        </div>
      </div>

      {matched.account && (
        <Section title="Account">
          <SettingRow label="Edit login methods">
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 border border-ink-500 hover:border-white text-white text-sm font-bold px-4 py-1.5 rounded-full transition"
            >
              Edit <Icon icon="mdi:open-in-new" width={16} />
            </button>
          </SettingRow>
        </Section>
      )}

      {matched.language && (
        <Section title="Language">
          <SettingRow label="Choose language - Changes will be applied after restarting the app">
            <button
              onClick={openLanguage}
              className="flex items-center justify-between gap-3 bg-ink-700 hover:bg-ink-600 text-white text-sm font-medium rounded-md py-2 pl-4 pr-3 border border-ink-600 min-w-[180px] transition"
            >
              <span className="truncate">{language}</span>
              <Icon icon="mdi:chevron-down" width={20} className="text-ink-300" />
            </button>
          </SettingRow>
        </Section>
      )}

      {matched.audio && (
        <Section title="Audio quality">
          <SettingRow label="Streaming quality">
            <Select
              ariaLabel="Streaming quality"
              value={settings.streamingQuality}
              onChange={(v) => setSetting("streamingQuality", v)}
              options={QUALITY_OPTIONS}
            />
          </SettingRow>
          <SettingRow label="Normalize volume - Set the same volume level for all songs and podcasts">
            <Toggle
              label="Normalize volume"
              checked={settings.normalizeVolume}
              onChange={(v) => setSetting("normalizeVolume", v)}
            />
          </SettingRow>
        </Section>
      )}

      {matched.library && (
        <Section title="Your Library">
          <SettingRow label="Use compact library layout">
            <Toggle
              label="Use compact library layout"
              checked={settings.compactLibrary}
              onChange={(v) => setSetting("compactLibrary", v)}
            />
          </SettingRow>
          <SettingRow label="Import music from other apps">
            <button
              onClick={() =>
                toast.info("Importing from other apps isn't available in this demo.")
              }
              className="text-white text-sm font-bold border border-ink-500 hover:border-white px-4 py-1.5 rounded-full transition"
            >
              Import library
            </button>
          </SettingRow>
        </Section>
      )}

      {matched.display && (
        <Section title="Display">
          <SettingRow label="Show the now-playing panel on click of play">
            <Toggle
              label="Show the now-playing panel on click of play"
              checked={settings.showNowPlayingPanel}
              onChange={(v) => setSetting("showNowPlayingPanel", v)}
            />
          </SettingRow>
        </Section>
      )}

      {matched.videos && (
        <Section
          title="Videos and Canvas"
          info="It may take some time for your experience to update."
        >
          <SettingRow
            label="Canvas"
            desc="Short, looping visuals when a song is playing."
          >
            <Toggle
              label="Canvas"
              checked={settings.canvas}
              onChange={(v) => setSetting("canvas", v)}
            />
          </SettingRow>
          <SettingRow
            label="Other videos"
            desc="Vertically scrolling videos, video podcasts, and videos from creators and authors."
          >
            <Toggle
              label="Other videos"
              checked={settings.otherVideos}
              onChange={(v) => setSetting("otherVideos", v)}
            />
          </SettingRow>
        </Section>
      )}

      {matched.playback && (
        <Section title="Playback">
          <div className="py-3">
            <Equalizer />
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-ink-800/60 rounded-2xl p-6">
              <div>
                <div className="text-xl font-extrabold text-white">
                  Fine-tune your sound
                </div>
                <div className="text-sm text-ink-300 mt-1 max-w-md">
                  Improve streaming quality, adjust the equalizer to best fit your
                  speakers, and enjoy consistent volume across all your tracks.
                </div>
              </div>
              <button
                onClick={() =>
                  toast.info("The desktop app download isn't part of this demo.")
                }
                className="shrink-0 bg-brand hover:bg-brand-light text-black font-bold px-6 py-3 rounded-full transition"
              >
                Download the free app
              </button>
            </div>
          </div>
        </Section>
      )}

      {matched.activity && (
        <Section title="Listening activity and insights">
          <SettingRow
            label="Listening activity on desktop and mobile"
            desc="People on Moodwave can see the music you're playing, stats on how your tastes compare and ask to Jam."
          >
            <Toggle
              label="Listening activity"
              checked={settings.listeningActivity}
              onChange={(v) => setSetting("listeningActivity", v)}
            />
          </SettingRow>
        </Section>
      )}

      {!anyMatch && (
        <div className="text-center text-ink-500 py-16">
          No settings match “{query}”.
        </div>
      )}
    </div>
  );
};

export default Settings;

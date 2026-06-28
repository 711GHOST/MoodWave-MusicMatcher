import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const SettingsContext = createContext(null);
const STORAGE_KEY = "mw_settings";

// App-wide preferences, persisted to localStorage. These mirror the Spotify
// settings surface; a few drive real behaviour (compact library, now-playing
// panel, volume normalisation) while the rest are stored preferences for a
// clone without the underlying media pipeline.
export const DEFAULT_SETTINGS = {
  streamingQuality: "automatic", // automatic | low | normal | high | veryhigh
  normalizeVolume: false,
  compactLibrary: false,
  showNowPlayingPanel: true,
  canvas: true,
  otherVideos: true,
  listeningActivity: false,
  // Six-band equalizer gains in dB (-12 .. +12), one per labelled frequency.
  equalizer: [0, 0, 0, 0, 0, 0],
};

export const EQ_BANDS = ["60Hz", "150Hz", "400Hz", "1KHz", "2.4KHz", "15KHz"];

export const QUALITY_OPTIONS = [
  { value: "automatic", label: "Automatic" },
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "veryhigh", label: "Very high" },
];

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return { ...DEFAULT_SETTINGS, ...saved };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const setSetting = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setEqBand = useCallback((index, value) => {
    setSettings((prev) => {
      const equalizer = [...prev.equalizer];
      equalizer[index] = value;
      return { ...prev, equalizer };
    });
  }, []);

  const resetSettings = useCallback(
    () => setSettings({ ...DEFAULT_SETTINGS }),
    []
  );

  return (
    <SettingsContext.Provider
      value={{ settings, setSetting, setEqBand, resetSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx)
    throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
};

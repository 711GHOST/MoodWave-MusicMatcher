import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Howl } from "howler";
import { getPlaylistById } from "../api/playlists";
import { useSettings } from "./SettingsContext";
import { pushRecentlyPlayed } from "../utils/recentlyPlayed";

const PlayerContext = createContext(null);

// When "Normalize volume" is on, apply a gentle, consistent gain so loud and
// quiet tracks play at a more even level. (Simulated — true loudness
// normalization would use per-track ReplayGain data from the server.)
const NORMALIZE_GAIN = 0.9;

export function PlayerProvider({ children }) {
  const { settings } = useSettings();
  const normalizeRef = useRef(settings.normalizeVolume);
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState("off"); // "off" | "all" | "one"
  // Sleep timer: minutes remaining (counts down) or "end" (stop after track).
  const [sleepMinutes, setSleepMinutes] = useState(null);
  const [sleepEndOfTrack, setSleepEndOfTrack] = useState(false);

  // Refs mirror state so Howl event callbacks always read current values.
  const soundRef = useRef(null);
  const queueRef = useRef([]);
  const indexRef = useRef(0);
  const repeatRef = useRef("off");
  const shuffleRef = useRef(false);
  const volumeRef = useRef(0.8);
  const mutedRef = useRef(false);
  const preMuteVolumeRef = useRef(0.8);
  const handleEndRef = useRef(() => {});
  const sleepEndOfTrackRef = useRef(false);
  const sleepDeadlineRef = useRef(null); // epoch ms when playback should pause

  // Effective gain applied to Howl, honoring the mute + normalize-volume settings.
  const effectiveVolume = useCallback((v) => {
    if (mutedRef.current) return 0;
    return normalizeRef.current ? v * NORMALIZE_GAIN : v;
  }, []);

  // Re-apply volume whenever the normalize setting flips.
  useEffect(() => {
    normalizeRef.current = settings.normalizeVolume;
    if (soundRef.current) {
      soundRef.current.volume(effectiveVolume(volumeRef.current));
    }
  }, [settings.normalizeVolume, effectiveVolume]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);
  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);
  useEffect(() => {
    shuffleRef.current = shuffle;
  }, [shuffle]);

  const currentSong = queue[index] || null;

  // Poll the playing sound for progress.
  useEffect(() => {
    const id = setInterval(() => {
      const s = soundRef.current;
      if (s && s.playing()) {
        setProgress(s.seek() || 0);
        const d = s.duration();
        if (d) setDuration(d);
      }
    }, 250);
    return () => clearInterval(id);
  }, []);

  // Unload audio on unmount.
  useEffect(
    () => () => {
      if (soundRef.current) soundRef.current.unload();
    },
    []
  );

  const loadAndPlay = useCallback((song) => {
    if (soundRef.current) {
      soundRef.current.unload();
      soundRef.current = null;
    }
    if (!song || !song.track) {
      setIsPlaying(false);
      return;
    }
    const sound = new Howl({
      src: [song.track],
      html5: true,
      volume: effectiveVolume(volumeRef.current),
      onplay: () => {
        setIsPlaying(true);
        const d = sound.duration();
        if (d) setDuration(d);
      },
      onpause: () => setIsPlaying(false),
      onstop: () => setIsPlaying(false),
      onend: () => handleEndRef.current(),
      onload: () => {
        const d = sound.duration();
        if (d) setDuration(d);
      },
      onloaderror: () => setIsPlaying(false),
    });
    soundRef.current = sound;
    setProgress(0);
    pushRecentlyPlayed(song);
    sound.play();
  }, [effectiveVolume]);

  const playIndex = useCallback(
    (i) => {
      const q = queueRef.current;
      if (i < 0 || i >= q.length) return;
      setIndex(i);
      indexRef.current = i;
      loadAndPlay(q[i]);
    },
    [loadAndPlay]
  );

  const playQueue = useCallback(
    (songs, start = 0) => {
      if (!songs || !songs.length) return;
      const s = Math.max(0, Math.min(start, songs.length - 1));
      setQueue(songs);
      queueRef.current = songs;
      setIndex(s);
      indexRef.current = s;
      loadAndPlay(songs[s]);
    },
    [loadAndPlay]
  );

  const next = useCallback(() => {
    const q = queueRef.current;
    if (!q.length) return;
    let i = indexRef.current;
    if (shuffleRef.current && q.length > 1) {
      let r;
      do {
        r = Math.floor(Math.random() * q.length);
      } while (r === i);
      i = r;
    } else {
      i = i + 1 >= q.length ? 0 : i + 1;
    }
    playIndex(i);
  }, [playIndex]);

  const prev = useCallback(() => {
    const q = queueRef.current;
    if (!q.length) return;
    const s = soundRef.current;
    if (s && (s.seek() || 0) > 3) {
      s.seek(0);
      setProgress(0);
      return;
    }
    let i = indexRef.current - 1;
    if (i < 0) i = q.length - 1;
    playIndex(i);
  }, [playIndex]);

  // Recomputed every render and stashed in a ref so the Howl "end" callback
  // always sees the latest shuffle/repeat/queue state.
  const handleEnd = () => {
    const q = queueRef.current;
    const i = indexRef.current;
    // Sleep timer set to "end of track" — stop instead of advancing.
    if (sleepEndOfTrackRef.current) {
      sleepEndOfTrackRef.current = false;
      setSleepEndOfTrack(false);
      setIsPlaying(false);
      return;
    }
    if (repeatRef.current === "one") {
      const s = soundRef.current;
      if (s) {
        s.seek(0);
        s.play();
      }
      return;
    }
    if (shuffleRef.current && q.length > 1) {
      next();
      return;
    }
    if (i >= q.length - 1) {
      if (repeatRef.current === "all") playIndex(0);
      else setIsPlaying(false);
      return;
    }
    playIndex(i + 1);
  };
  handleEndRef.current = handleEnd;

  const togglePlay = useCallback(() => {
    const s = soundRef.current;
    if (!s) {
      if (queueRef.current.length) playIndex(indexRef.current);
      return;
    }
    if (s.playing()) s.pause();
    else s.play();
  }, [playIndex]);

  const seekTo = useCallback((seconds) => {
    const s = soundRef.current;
    if (!s) return;
    s.seek(seconds);
    setProgress(seconds);
  }, []);

  const setVolume = useCallback(
    (v) => {
      const vol = Math.max(0, Math.min(1, v));
      volumeRef.current = vol;
      setVolumeState(vol);
      // Dragging the slider above zero implicitly unmutes.
      if (vol > 0 && mutedRef.current) {
        mutedRef.current = false;
        setMuted(false);
      }
      if (soundRef.current) soundRef.current.volume(effectiveVolume(vol));
    },
    [effectiveVolume]
  );

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const nextMuted = !m;
      mutedRef.current = nextMuted;
      if (nextMuted) {
        preMuteVolumeRef.current = volumeRef.current || 0.8;
      } else if (volumeRef.current === 0) {
        // Unmuting from a zero slider restores the pre-mute level.
        const restored = preMuteVolumeRef.current || 0.8;
        volumeRef.current = restored;
        setVolumeState(restored);
      }
      if (soundRef.current) {
        soundRef.current.volume(
          nextMuted ? 0 : effectiveVolume(volumeRef.current)
        );
      }
      return nextMuted;
    });
  }, [effectiveVolume]);

  const toggleShuffle = useCallback(() => setShuffle((s) => !s), []);
  const cycleRepeat = useCallback(
    () =>
      setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off")),
    []
  );

  // --- Queue manipulation ------------------------------------------------
  // Append a song to the end of the queue (starts playback if idle).
  const addToQueue = useCallback(
    (song) => {
      if (!song) return;
      const q = queueRef.current;
      if (!q.length) {
        playQueue([song], 0);
        return;
      }
      const nq = [...q, song];
      queueRef.current = nq;
      setQueue(nq);
    },
    [playQueue]
  );

  // Insert a song to play immediately after the current track.
  const playNext = useCallback(
    (song) => {
      if (!song) return;
      const q = queueRef.current;
      if (!q.length) {
        playQueue([song], 0);
        return;
      }
      const at = indexRef.current + 1;
      const nq = [...q.slice(0, at), song, ...q.slice(at)];
      queueRef.current = nq;
      setQueue(nq);
    },
    [playQueue]
  );

  const removeFromQueue = useCallback((i) => {
    const q = queueRef.current;
    if (i <= indexRef.current || i >= q.length) return; // only future tracks
    const nq = [...q.slice(0, i), ...q.slice(i + 1)];
    queueRef.current = nq;
    setQueue(nq);
  }, []);

  // --- Sleep timer -------------------------------------------------------
  // value: a number of minutes, the string "end" (stop after the current
  // track finishes), or null/0 to cancel.
  const setSleepTimer = useCallback((value) => {
    if (value === "end") {
      sleepEndOfTrackRef.current = true;
      setSleepEndOfTrack(true);
      sleepDeadlineRef.current = null;
      setSleepMinutes(null);
      return;
    }
    sleepEndOfTrackRef.current = false;
    setSleepEndOfTrack(false);
    if (!value) {
      sleepDeadlineRef.current = null;
      setSleepMinutes(null);
      return;
    }
    sleepDeadlineRef.current = Date.now() + value * 60 * 1000;
    setSleepMinutes(value);
  }, []);

  // Tick the countdown timer and pause playback when it elapses.
  useEffect(() => {
    if (sleepMinutes == null) return undefined;
    const id = setInterval(() => {
      if (!sleepDeadlineRef.current) return;
      const remainingMs = sleepDeadlineRef.current - Date.now();
      if (remainingMs <= 0) {
        if (soundRef.current && soundRef.current.playing()) {
          soundRef.current.pause();
        }
        sleepDeadlineRef.current = null;
        setSleepMinutes(null);
      } else {
        // Re-render so the UI shows minutes remaining.
        setSleepMinutes(Math.ceil(remainingMs / 60000));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [sleepMinutes]);

  const stop = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current.unload();
      soundRef.current = null;
    }
    setIsPlaying(false);
    setQueue([]);
    queueRef.current = [];
    setIndex(0);
    indexRef.current = 0;
    setProgress(0);
    setDuration(0);
  }, []);

  const playPlaylistById = useCallback(
    async (id) => {
      const pl = await getPlaylistById(id);
      if (pl && pl.songs && pl.songs.length) playQueue(pl.songs, 0);
      return pl;
    },
    [playQueue]
  );

  return (
    <PlayerContext.Provider
      value={{
        queue,
        index,
        currentSong,
        isPlaying,
        progress,
        duration,
        volume,
        muted,
        shuffle,
        repeat,
        sleepMinutes,
        sleepEndOfTrack,
        playQueue,
        playIndex,
        playPlaylistById,
        togglePlay,
        next,
        prev,
        seekTo,
        setVolume,
        toggleMute,
        toggleShuffle,
        cycleRepeat,
        addToQueue,
        playNext,
        removeFromQueue,
        setSleepTimer,
        stop,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within a PlayerProvider");
  return ctx;
};

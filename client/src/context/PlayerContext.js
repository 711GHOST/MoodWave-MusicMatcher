import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getPlaylistById } from "../api/playlists";
import { useSettings } from "./SettingsContext";
import { pushRecentlyPlayed } from "../utils/recentlyPlayed";
import useAudioEngine from "../hooks/useAudioEngine";
import useSleepTimer from "../hooks/useSleepTimer";

const PlayerContext = createContext(null);

// Orchestrates the playback queue (shuffle/repeat/next/prev), volume policy and
// recently-played history. The audio element + Web Audio graph live in
// useAudioEngine (which applies the equalizer and volume-normalization for
// real), and the countdown in useSleepTimer; this provider wires them together.
export function PlayerProvider({ children }) {
  const { settings } = useSettings();

  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState("off"); // "off" | "all" | "one"

  // Refs mirror state so the audio "end" callback always reads current values.
  const queueRef = useRef([]);
  const indexRef = useRef(0);
  const repeatRef = useRef("off");
  const shuffleRef = useRef(false);
  const volumeRef = useRef(0.8);
  const mutedRef = useRef(false);
  const preMuteVolumeRef = useRef(0.8);
  const handleEndRef = useRef(() => {});

  // Volume gain applied to the engine (mute just drops it to 0). Loudness
  // normalization is handled separately by the engine's compressor.
  const effectiveVolume = useCallback((v) => (mutedRef.current ? 0 : v), []);

  // Audio engine — native element + Web Audio graph. Stable method refs.
  const {
    isPlaying,
    progress,
    duration,
    load: engineLoad,
    pause: enginePause,
    resume: engineResume,
    seek: engineSeek,
    restart: engineRestart,
    setGain: engineSetGain,
    stop: engineStop,
    markStopped: engineMarkStopped,
    hasSound: engineHasSound,
    playing: enginePlaying,
    currentSeek: engineCurrentSeek,
    applyEqualizer,
    setNormalize,
  } = useAudioEngine({
    onEnd: () => handleEndRef.current(),
    getGain: () => effectiveVolume(volumeRef.current),
  });

  // Sleep timer pauses playback when it elapses.
  const { sleepMinutes, sleepEndOfTrack, setSleepTimer, consumeEndOfTrack } =
    useSleepTimer(() => {
      if (enginePlaying()) enginePause();
    });

  // Wire the Settings equalizer + normalize toggle to the Web Audio graph.
  useEffect(() => {
    setNormalize(settings.normalizeVolume);
  }, [settings.normalizeVolume, setNormalize]);
  useEffect(() => {
    applyEqualizer(settings.equalizer);
  }, [settings.equalizer, applyEqualizer]);

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

  const loadAndPlay = useCallback(
    (song) => {
      engineLoad(song);
      if (song && song.track) pushRecentlyPlayed(song);
    },
    [engineLoad]
  );

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
    // Restart the current track if we're more than 3s in.
    if (engineCurrentSeek() > 3) {
      engineSeek(0);
      return;
    }
    let i = indexRef.current - 1;
    if (i < 0) i = q.length - 1;
    playIndex(i);
  }, [playIndex, engineCurrentSeek, engineSeek]);

  // Recomputed every render and stashed in a ref so the engine "end" callback
  // always sees the latest shuffle/repeat/queue state.
  const handleEnd = () => {
    const q = queueRef.current;
    const i = indexRef.current;
    // Sleep timer "end of track" — stop instead of advancing.
    if (consumeEndOfTrack()) {
      engineMarkStopped();
      return;
    }
    if (repeatRef.current === "one") {
      engineRestart();
      return;
    }
    if (shuffleRef.current && q.length > 1) {
      next();
      return;
    }
    if (i >= q.length - 1) {
      if (repeatRef.current === "all") playIndex(0);
      else engineMarkStopped();
      return;
    }
    playIndex(i + 1);
  };
  handleEndRef.current = handleEnd;

  const togglePlay = useCallback(() => {
    if (!engineHasSound()) {
      if (queueRef.current.length) playIndex(indexRef.current);
      return;
    }
    if (enginePlaying()) enginePause();
    else engineResume();
  }, [playIndex, engineHasSound, enginePlaying, enginePause, engineResume]);

  const seekTo = useCallback((seconds) => engineSeek(seconds), [engineSeek]);

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
      engineSetGain(effectiveVolume(vol));
    },
    [effectiveVolume, engineSetGain]
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
      engineSetGain(nextMuted ? 0 : effectiveVolume(volumeRef.current));
      return nextMuted;
    });
  }, [effectiveVolume, engineSetGain]);

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

  const stop = useCallback(() => {
    engineStop();
    setQueue([]);
    queueRef.current = [];
    setIndex(0);
    indexRef.current = 0;
  }, [engineStop]);

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

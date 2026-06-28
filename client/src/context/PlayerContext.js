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

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState("off"); // "off" | "all" | "one"

  // Refs mirror state so Howl event callbacks always read current values.
  const soundRef = useRef(null);
  const queueRef = useRef([]);
  const indexRef = useRef(0);
  const repeatRef = useRef("off");
  const shuffleRef = useRef(false);
  const volumeRef = useRef(0.8);
  const handleEndRef = useRef(() => {});

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
      volume: volumeRef.current,
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
    sound.play();
  }, []);

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

  const setVolume = useCallback((v) => {
    const vol = Math.max(0, Math.min(1, v));
    volumeRef.current = vol;
    setVolumeState(vol);
    if (soundRef.current) soundRef.current.volume(vol);
  }, []);

  const toggleShuffle = useCallback(() => setShuffle((s) => !s), []);
  const cycleRepeat = useCallback(
    () =>
      setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off")),
    []
  );

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
        shuffle,
        repeat,
        playQueue,
        playIndex,
        playPlaylistById,
        togglePlay,
        next,
        prev,
        seekTo,
        setVolume,
        toggleShuffle,
        cycleRepeat,
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

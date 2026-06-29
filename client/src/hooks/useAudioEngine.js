import { useCallback, useEffect, useRef, useState } from "react";
import { Howl } from "howler";

// Owns the Howl instance and the low-level transport state
// (isPlaying / progress / duration). Queue, shuffle, repeat and volume policy
// live in PlayerContext, which drives this engine imperatively and reacts to
// `onEnd`. `getGain` returns the gain (0..1) to apply when a track loads.
export default function useAudioEngine({ onEnd, getGain }) {
  const soundRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Keep the latest callbacks without re-creating the engine.
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;
  const getGainRef = useRef(getGain);
  getGainRef.current = getGain;

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

  const load = useCallback((song) => {
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
      volume: getGainRef.current(),
      onplay: () => {
        setIsPlaying(true);
        const d = sound.duration();
        if (d) setDuration(d);
      },
      onpause: () => setIsPlaying(false),
      onstop: () => setIsPlaying(false),
      onend: () => onEndRef.current && onEndRef.current(),
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

  const pause = useCallback(() => {
    if (soundRef.current) soundRef.current.pause();
  }, []);

  const resume = useCallback(() => {
    if (soundRef.current) soundRef.current.play();
  }, []);

  const seek = useCallback((seconds) => {
    const s = soundRef.current;
    if (!s) return;
    s.seek(seconds);
    setProgress(seconds);
  }, []);

  // Restart the current track from the beginning (used by repeat-one).
  const restart = useCallback(() => {
    const s = soundRef.current;
    if (!s) return;
    s.seek(0);
    s.play();
    setProgress(0);
  }, []);

  const setGain = useCallback((gain) => {
    if (soundRef.current) soundRef.current.volume(gain);
  }, []);

  const stop = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current.unload();
      soundRef.current = null;
    }
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
  }, []);

  // Flip the UI to "paused" without touching the audio (e.g. queue exhausted).
  const markStopped = useCallback(() => setIsPlaying(false), []);

  const hasSound = useCallback(() => !!soundRef.current, []);
  const playing = useCallback(
    () => !!(soundRef.current && soundRef.current.playing()),
    []
  );
  const currentSeek = useCallback(
    () => (soundRef.current ? soundRef.current.seek() || 0 : 0),
    []
  );

  return {
    isPlaying,
    progress,
    duration,
    load,
    pause,
    resume,
    seek,
    restart,
    setGain,
    stop,
    markStopped,
    hasSound,
    playing,
    currentSeek,
  };
}

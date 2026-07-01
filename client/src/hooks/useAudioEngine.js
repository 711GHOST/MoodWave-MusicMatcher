import { useCallback, useEffect, useRef, useState } from "react";
import { proxiedTrack } from "../utils/audioProxy";

// Equalizer band centre frequencies (Hz), matching the Settings UI.
const EQ_FREQS = [60, 150, 400, 1000, 2400, 15000];

// Owns a single persistent <audio> element routed through a Web Audio graph:
//   source -> 6 peaking filters (EQ) -> compressor (normalize) -> gain -> out
// The graph is built lazily on first play (needs a user gesture + AudioContext);
// where Web Audio is unavailable (e.g. jsdom) it falls back to plain playback.
export default function useAudioEngine({ onEnd, getGain }) {
  const elRef = useRef(null);
  const graphRef = useRef(null); // { ctx, source, bands[], compressor, gain }
  const eqRef = useRef([0, 0, 0, 0, 0, 0]);
  const normalizeRef = useRef(false);
  const hasTrackRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;
  const getGainRef = useRef(getGain);
  getGainRef.current = getGain;

  // Create the persistent audio element once.
  useEffect(() => {
    const el = new Audio();
    el.crossOrigin = "anonymous"; // required so Web Audio can read the samples
    el.preload = "auto";
    elRef.current = el;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      if (onEndRef.current) onEndRef.current();
    };
    const onLoaded = () => {
      if (el.duration && !Number.isNaN(el.duration)) setDuration(el.duration);
    };
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    el.addEventListener("loadedmetadata", onLoaded);

    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("loadedmetadata", onLoaded);
      try {
        el.pause();
      } catch {
        /* ignore */
      }
      el.removeAttribute("src");
    };
  }, []);

  // Poll for progress while playing (matches the previous 250ms cadence).
  useEffect(() => {
    const id = setInterval(() => {
      const el = elRef.current;
      if (el && !el.paused && hasTrackRef.current) {
        setProgress(el.currentTime || 0);
        if (el.duration && !Number.isNaN(el.duration)) setDuration(el.duration);
      }
    }, 250);
    return () => clearInterval(id);
  }, []);

  const applyNormalize = (compressor, on) => {
    if (on) {
      compressor.threshold.value = -24;
      compressor.knee.value = 30;
      compressor.ratio.value = 12;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;
    } else {
      // ratio 1 + threshold 0 => effectively transparent.
      compressor.threshold.value = 0;
      compressor.knee.value = 0;
      compressor.ratio.value = 1;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;
    }
  };

  // Build the Web Audio graph once (returns null where unsupported).
  const ensureGraph = useCallback(() => {
    if (graphRef.current) return graphRef.current;
    const el = elRef.current;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!el || !AC) return null;
    try {
      const ctx = new AC();
      const source = ctx.createMediaElementSource(el);
      const bands = EQ_FREQS.map((freq, i) => {
        const f = ctx.createBiquadFilter();
        f.type = "peaking";
        f.frequency.value = freq;
        f.Q.value = 1;
        f.gain.value = eqRef.current[i] || 0;
        return f;
      });
      const compressor = ctx.createDynamicsCompressor();
      const gain = ctx.createGain();
      gain.gain.value = getGainRef.current ? getGainRef.current() : 1;

      let node = source;
      bands.forEach((b) => {
        node.connect(b);
        node = b;
      });
      node.connect(compressor);
      compressor.connect(gain);
      gain.connect(ctx.destination);

      applyNormalize(compressor, normalizeRef.current);
      graphRef.current = { ctx, source, bands, compressor, gain };
      // Dev-only handle so the Web Audio graph can be inspected during testing.
      if (process.env.NODE_ENV !== "production") {
        window.__mwAudio = graphRef.current;
      }
      return graphRef.current;
    } catch {
      return null; // fall back to element-only playback
    }
  }, []);

  const resumeCtx = () => {
    const g = graphRef.current;
    if (g && g.ctx.state === "suspended") {
      try {
        g.ctx.resume();
      } catch {
        /* ignore */
      }
    }
  };

  const safePlay = (el) => {
    try {
      const p = el.play();
      if (p && p.catch) p.catch(() => {});
    } catch {
      /* jsdom / autoplay */
    }
  };

  const load = useCallback(
    (song) => {
      const el = elRef.current;
      if (!el) return;
      if (!song || !song.track) {
        hasTrackRef.current = false;
        try {
          el.pause();
        } catch {
          /* ignore */
        }
        setIsPlaying(false);
        return;
      }
      hasTrackRef.current = true;
      el.src = proxiedTrack(song.track);
      setProgress(0);
      const graph = ensureGraph();
      if (graph) {
        graph.gain.gain.value = getGainRef.current ? getGainRef.current() : 1;
        resumeCtx();
      } else {
        el.volume = getGainRef.current ? getGainRef.current() : 1;
      }
      safePlay(el);
    },
    [ensureGraph]
  );

  const pause = useCallback(() => {
    try {
      elRef.current?.pause();
    } catch {
      /* ignore */
    }
  }, []);

  const resume = useCallback(() => {
    const el = elRef.current;
    if (!el) return;
    resumeCtx();
    safePlay(el);
  }, []);

  const seek = useCallback((seconds) => {
    const el = elRef.current;
    if (!el) return;
    try {
      el.currentTime = seconds;
    } catch {
      /* ignore */
    }
    setProgress(seconds);
  }, []);

  const restart = useCallback(() => {
    const el = elRef.current;
    if (!el) return;
    try {
      el.currentTime = 0;
    } catch {
      /* ignore */
    }
    safePlay(el);
    setProgress(0);
  }, []);

  const setGain = useCallback((gain) => {
    const g = graphRef.current;
    if (g) g.gain.gain.value = gain;
    else if (elRef.current)
      elRef.current.volume = Math.max(0, Math.min(1, gain));
  }, []);

  const stop = useCallback(() => {
    const el = elRef.current;
    if (el) {
      try {
        el.pause();
      } catch {
        /* ignore */
      }
      el.removeAttribute("src");
    }
    hasTrackRef.current = false;
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
  }, []);

  const markStopped = useCallback(() => setIsPlaying(false), []);
  const hasSound = useCallback(() => hasTrackRef.current, []);
  const playing = useCallback(() => {
    const el = elRef.current;
    return !!(el && !el.paused && hasTrackRef.current);
  }, []);
  const currentSeek = useCallback(
    () => (elRef.current ? elRef.current.currentTime || 0 : 0),
    []
  );

  // --- Web Audio effects driven by Settings ------------------------------
  const applyEqualizer = useCallback((bands) => {
    eqRef.current = Array.isArray(bands) ? bands : [];
    const g = graphRef.current;
    if (g) g.bands.forEach((b, i) => (b.gain.value = eqRef.current[i] || 0));
  }, []);

  const setNormalize = useCallback((on) => {
    normalizeRef.current = !!on;
    const g = graphRef.current;
    if (g) applyNormalize(g.compressor, !!on);
  }, []);

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
    applyEqualizer,
    setNormalize,
  };
}

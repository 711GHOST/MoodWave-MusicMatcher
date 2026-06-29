import { useCallback, useEffect, useRef, useState } from "react";

// Owns the sleep-timer countdown. `onElapse` runs once when the timer reaches
// zero (PlayerContext uses it to pause playback). "End of track" is tracked
// separately and consumed by the player when the current song finishes.
export default function useSleepTimer(onElapse) {
  const [sleepMinutes, setSleepMinutes] = useState(null);
  const [sleepEndOfTrack, setSleepEndOfTrack] = useState(false);
  const deadlineRef = useRef(null); // epoch ms when playback should pause
  const endOfTrackRef = useRef(false);
  const onElapseRef = useRef(onElapse);
  onElapseRef.current = onElapse;

  // value: minutes (number), "end" (stop after current track), or 0/null to cancel.
  const setSleepTimer = useCallback((value) => {
    if (value === "end") {
      endOfTrackRef.current = true;
      setSleepEndOfTrack(true);
      deadlineRef.current = null;
      setSleepMinutes(null);
      return;
    }
    endOfTrackRef.current = false;
    setSleepEndOfTrack(false);
    if (!value) {
      deadlineRef.current = null;
      setSleepMinutes(null);
      return;
    }
    deadlineRef.current = Date.now() + value * 60 * 1000;
    setSleepMinutes(value);
  }, []);

  // Returns true (and disarms) when "stop at end of track" was set.
  const consumeEndOfTrack = useCallback(() => {
    if (!endOfTrackRef.current) return false;
    endOfTrackRef.current = false;
    setSleepEndOfTrack(false);
    return true;
  }, []);

  // Tick the countdown and fire onElapse when it runs out.
  useEffect(() => {
    if (sleepMinutes == null) return undefined;
    const id = setInterval(() => {
      if (!deadlineRef.current) return;
      const remainingMs = deadlineRef.current - Date.now();
      if (remainingMs <= 0) {
        if (onElapseRef.current) onElapseRef.current();
        deadlineRef.current = null;
        setSleepMinutes(null);
      } else {
        // Re-render so the UI shows minutes remaining.
        setSleepMinutes(Math.ceil(remainingMs / 60000));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [sleepMinutes]);

  return { sleepMinutes, sleepEndOfTrack, setSleepTimer, consumeEndOfTrack };
}

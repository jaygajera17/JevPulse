import React, { useState, useEffect, useRef } from 'react';

/**
 * LiveTimer renders a millisecond-precision stopwatch.
 * Uses requestAnimationFrame while running so it updates smoothly at 60fps
 * without re-rendering parent components.
 */
export function LiveTimer({ startTime, isRunning = true, finalMs = null }) {
  const [liveMs, setLiveMs] = useState(0);
  const animRef = useRef(null);

  useEffect(() => {
    if (!isRunning || !startTime) return;

    const tick = () => {
      const now = performance.now();
      const diff = Math.max(0, Math.round(now - startTime));
      setLiveMs(diff);
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [startTime, isRunning]);

  const ms = !isRunning && finalMs != null ? finalMs : liveMs;

  // Format mm:ss.mmm
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const millis = ms % 1000;

  const pad2 = (n) => String(n).padStart(2, '0');
  const pad3 = (n) => String(n).padStart(3, '0');

  return (
    <div className="live-timer-wrap">
      <div className="live-timer-digits">
        <span className="timer-unit min-sec">
          {pad2(minutes)}:{pad2(seconds)}
        </span>
        <span className="timer-separator">.</span>
        <span className="timer-unit millis">
          {pad3(millis)}
        </span>
      </div>
      <div className="live-timer-sub">
        <span className="timer-pulse-ring" />
        <span>MILLISECOND PRECISE STOPWATCH</span>
      </div>
    </div>
  );
}

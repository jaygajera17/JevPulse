import { useState, useEffect, useRef } from 'react';

/**
 * Hook to smoothly animate a number towards a target value.
 *
 * @param {number} targetValue
 * @param {number} duration - in milliseconds
 * @returns {number}
 */
export function useCounter(targetValue, duration = 600) {
  const [current, setCurrent] = useState(targetValue || 0);
  const startRef = useRef(current);
  const targetRef = useRef(targetValue || 0);
  const startTimeRef = useRef(null);

  useEffect(() => {
    startRef.current = current;
    targetRef.current = targetValue || 0;
    startTimeRef.current = null;

    if (startRef.current === targetRef.current) return;

    let animId;

    const step = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing: easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = Math.round(startRef.current + (targetRef.current - startRef.current) * eased);
      
      setCurrent(val);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setCurrent(targetRef.current);
      }
    };

    animId = requestAnimationFrame(step);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [targetValue, duration]);

  return current;
}

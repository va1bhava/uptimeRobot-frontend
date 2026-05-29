import { useState, useEffect } from 'react';

/**
 * Animated counter hook — smoothly interpolates from current value to target.
 * Isolated to prevent re-render propagation to parent components.
 */
export default function useAnimatedCounter(targetValue, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const startValue = value;
    if (startValue === targetValue) return;

    let animationFrameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (targetValue - startValue) * eased);
      setValue(current);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [targetValue, duration]);

  return value;
}

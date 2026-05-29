import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Custom hook for scroll-driven zoom animations.
 * Uses IntersectionObserver for performant viewport detection,
 * then applies GPU-accelerated scale/opacity transforms.
 *
 * @param {Object} options
 * @param {number} options.scaleFrom - Starting scale when out of view (default 0.82)
 * @param {number} options.scaleTo - Target scale when in view (default 1)
 * @param {number} options.opacityFrom - Starting opacity (default 0)
 * @param {number} options.opacityTo - Target opacity (default 1)
 * @param {number} options.translateY - Starting translateY offset in px (default 50)
 * @param {number} options.threshold - IntersectionObserver threshold (default 0.1)
 * @param {number} options.delay - Stagger delay in ms (default 0)
 * @param {boolean} options.once - Only animate once (default true)
 */
export function useScrollZoom({
  scaleFrom = 0.82,
  scaleTo = 1,
  opacityFrom = 0,
  opacityTo = 1,
  translateY = 50,
  threshold = 0.1,
  delay = 0,
  once = true,
} = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  const style = {
    transform: isVisible
      ? `scale(${scaleTo}) translateY(0px)`
      : `scale(${scaleFrom}) translateY(${translateY}px)`,
    opacity: isVisible ? opacityTo : opacityFrom,
    transition: `transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
    willChange: 'transform, opacity',
  };

  return { ref, style, isVisible };
}

/**
 * Hook for batch scroll-zoom on a container's children.
 * Returns a ref for the container and a function to get staggered styles.
 */
export function useScrollZoomGroup({
  scaleFrom = 0.82,
  scaleTo = 1,
  opacityFrom = 0,
  opacityTo = 1,
  translateY = 50,
  threshold = 0.05,
  staggerMs = 80,
} = {}) {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const getItemStyle = useCallback(
    (index) => ({
      transform: isVisible
        ? `scale(${scaleTo}) translateY(0px)`
        : `scale(${scaleFrom}) translateY(${translateY}px)`,
      opacity: isVisible ? opacityTo : opacityFrom,
      transition: `transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${index * staggerMs}ms, opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${index * staggerMs}ms`,
      willChange: 'transform, opacity',
    }),
    [isVisible, scaleFrom, scaleTo, opacityFrom, opacityTo, translateY, staggerMs]
  );

  return { containerRef, isVisible, getItemStyle };
}

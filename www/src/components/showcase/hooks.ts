'use client';

import { useEffect, useState, type RefObject } from 'react';

/** Subscribes to a media query; `false` during SSR. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, [query]);
  return matches;
}

export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/** `true` while the document is visible (tab focused / not minimized). */
export function usePageVisible() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const update = () => setVisible(document.visibilityState !== 'hidden');
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  return visible;
}

/** `true` while any part of the element (by `threshold`) is in the viewport. */
export function useInView(
  ref: RefObject<Element | null>,
  {
    threshold = 0,
    rootMargin = '0px',
  }: { threshold?: number; rootMargin?: string } = {},
) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => setInView(entries.some((entry) => entry.isIntersecting)),
      { threshold, rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, threshold, rootMargin]);
  return inView;
}

/**
 * Should a scripted show run on this device at all? Not on touch-only
 * devices, small viewports, or with reduced motion.
 */
export function canRunScriptedShow(minViewportWidth = 768) {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    window.innerWidth >= minViewportWidth
  );
}

/** requestIdleCallback with a timeout fallback (Safari has no rIC). */
export function whenIdle(callback: () => void, timeout = 1500) {
  const w = window as Window & {
    requestIdleCallback?: (
      cb: () => void,
      opts?: { timeout: number },
    ) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(callback, { timeout });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(callback, Math.min(timeout, 300));
  return () => window.clearTimeout(id);
}

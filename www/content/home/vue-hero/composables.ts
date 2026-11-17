import {
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
  type Ref,
} from 'vue';

import type { HeroColorMode } from '../../../src/components/hero/themes';

/** Subscribes to a media query. */
export function useMediaQuery(query: string) {
  const mql = window.matchMedia(query);
  const matches = ref(mql.matches);
  const update = () => (matches.value = mql.matches);
  mql.addEventListener('change', update);
  onBeforeUnmount(() => mql.removeEventListener('change', update));
  return matches;
}

export const usePrefersReducedMotion = () =>
  useMediaQuery('(prefers-reduced-motion: reduce)');

/** `true` while the document is visible (tab focused / not minimized). */
export function usePageVisible() {
  const visible = ref(document.visibilityState !== 'hidden');
  const update = () => (visible.value = document.visibilityState !== 'hidden');
  document.addEventListener('visibilitychange', update);
  onBeforeUnmount(() =>
    document.removeEventListener('visibilitychange', update),
  );
  return visible;
}

/**
 * `true` while any part of the element is in the viewport. Inside an iframe
 * this is the viewport of the page that embeds it.
 */
export function useInView(target: Ref<Element | null>) {
  const inView = ref(false);
  let observer: IntersectionObserver | null = null;
  onMounted(() => {
    if (!target.value) return;
    observer = new IntersectionObserver((entries) => {
      inView.value = entries.some((entry) => entry.isIntersecting);
    });
    observer.observe(target.value);
  });
  onBeforeUnmount(() => observer?.disconnect());
  return inView;
}

/**
 * Light / dark, from `<html data-theme>`. The page that embeds the hero sets
 * it: `?theme=` on load, then a `set-theme` message whenever the site's mode
 * changes (the demo runtime writes both to the attribute).
 */
export function useColorMode() {
  const html = document.documentElement;
  const read = (): HeroColorMode =>
    html.dataset.theme === 'light' ? 'light' : 'dark';
  const mode = ref<HeroColorMode>(read());
  const observer = new MutationObserver(() => (mode.value = read()));
  observer.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
  onBeforeUnmount(() => observer.disconnect());
  return mode;
}

/**
 * Keeps a canvas sized to its CSS box at device-pixel resolution. Returns the
 * CSS size (the drawing code works in CSS pixels).
 */
export function useCanvasSize(canvas: Ref<HTMLCanvasElement | null>) {
  const size = shallowRef({ width: 0, height: 0 });
  let observer: ResizeObserver | null = null;
  let raf = 0;
  onMounted(() => {
    const el = canvas.value;
    if (!el) return;
    observer = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);
      // On the next frame: resizing the canvas inside the callback would be a
      // layout change during the observer's own delivery (a "ResizeObserver
      // loop" error).
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (width === size.value.width && height === size.value.height) return;
        if (width && height) {
          const dpr = Math.min(2, window.devicePixelRatio || 1);
          el.width = Math.round(width * dpr);
          el.height = Math.round(height * dpr);
        }
        size.value = { width, height };
      });
    });
    observer.observe(el);
  });
  onBeforeUnmount(() => {
    observer?.disconnect();
    cancelAnimationFrame(raf);
  });
  return size;
}

/** Runs `onFrame` every animation frame (capped at `fps`) while active. */
export function useFrameLoop(
  active: () => boolean,
  onFrame: (now: number) => void,
  fps = 60,
) {
  let raf = 0;
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };
  watch(
    active,
    (isActive) => {
      stop();
      if (!isActive) return;
      let last = 0;
      const minDelta = 1000 / fps - 2;
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        if (now - last < minDelta) return;
        last = now;
        onFrame(now);
      };
      raf = requestAnimationFrame(loop);
    },
    { immediate: true },
  );
  onBeforeUnmount(stop);
}

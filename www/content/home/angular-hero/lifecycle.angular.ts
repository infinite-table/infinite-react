/*
 * Signals and lifecycle helpers of the Angular hero (content/home/angular-hero):
 * the Angular counterparts of ../vue-hero/composables.ts. Each one is called
 * in an injection context (a field initializer or a constructor) and cleans up
 * when its component is destroyed.
 */
import {
  DestroyRef,
  afterNextRender,
  effect,
  inject,
  signal,
  type Signal,
} from '@angular/core';

import type { HeroColorMode } from '../../../src/components/hero/themes';

/** Subscribes to a media query. */
export function injectMediaQuery(query: string): Signal<boolean> {
  const mql = window.matchMedia(query);
  const matches = signal(mql.matches);
  const update = () => matches.set(mql.matches);
  mql.addEventListener('change', update);
  inject(DestroyRef).onDestroy(() => mql.removeEventListener('change', update));
  return matches.asReadonly();
}

export const injectPrefersReducedMotion = () =>
  injectMediaQuery('(prefers-reduced-motion: reduce)');

/** `true` while the document is visible (tab focused / not minimized). */
export function injectPageVisible(): Signal<boolean> {
  const visible = signal(document.visibilityState !== 'hidden');
  const update = () => visible.set(document.visibilityState !== 'hidden');
  document.addEventListener('visibilitychange', update);
  inject(DestroyRef).onDestroy(() =>
    document.removeEventListener('visibilitychange', update),
  );
  return visible.asReadonly();
}

/**
 * `true` while any part of the element is in the viewport. Inside an iframe
 * this is the viewport of the page that embeds it.
 */
export function injectInView(
  target: () => Element | null | undefined,
): Signal<boolean> {
  const inView = signal(false);
  let observer: IntersectionObserver | null = null;
  afterNextRender(() => {
    const element = target();
    if (!element) return;
    observer = new IntersectionObserver((entries) => {
      inView.set(entries.some((entry) => entry.isIntersecting));
    });
    observer.observe(element);
  });
  inject(DestroyRef).onDestroy(() => observer?.disconnect());
  return inView.asReadonly();
}

/**
 * Light / dark, from `<html data-theme>`. The page that embeds the hero sets
 * it: `?theme=` on load, then a `set-theme` message whenever the site's mode
 * changes (the demo runtime writes both to the attribute).
 */
export function injectColorMode(): Signal<HeroColorMode> {
  const html = document.documentElement;
  const read = (): HeroColorMode =>
    html.dataset.theme === 'light' ? 'light' : 'dark';
  const mode = signal<HeroColorMode>(read());
  const observer = new MutationObserver(() => mode.set(read()));
  observer.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
  inject(DestroyRef).onDestroy(() => observer.disconnect());
  return mode.asReadonly();
}

export type CanvasSize = { width: number; height: number };

/**
 * Keeps a canvas sized to its CSS box at device-pixel resolution. Returns the
 * CSS size (the drawing code works in CSS pixels).
 */
export function injectCanvasSize(
  canvas: () => HTMLCanvasElement | undefined,
): Signal<CanvasSize> {
  const size = signal<CanvasSize>({ width: 0, height: 0 });
  let observer: ResizeObserver | null = null;
  let raf = 0;
  afterNextRender(() => {
    const element = canvas();
    if (!element) return;
    observer = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);
      // On the next frame: resizing the canvas inside the callback would be a
      // layout change during the observer's own delivery (a "ResizeObserver
      // loop" error).
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const current = size();
        if (width === current.width && height === current.height) return;
        if (width && height) {
          const dpr = Math.min(2, window.devicePixelRatio || 1);
          element.width = Math.round(width * dpr);
          element.height = Math.round(height * dpr);
        }
        size.set({ width, height });
      });
    });
    observer.observe(element);
  });
  inject(DestroyRef).onDestroy(() => {
    observer?.disconnect();
    cancelAnimationFrame(raf);
  });
  return size.asReadonly();
}

/** Runs `onFrame` every animation frame (capped at `fps`) while `active()`. */
export function injectFrameLoop(
  active: () => boolean,
  onFrame: (now: number) => void,
  fps = 60,
) {
  effect((onCleanup) => {
    if (!active()) return;
    let raf = 0;
    let last = 0;
    const minDelta = 1000 / fps - 2;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < minDelta) return;
      last = now;
      onFrame(now);
    };
    raf = requestAnimationFrame(loop);
    onCleanup(() => cancelAnimationFrame(raf));
  });
}

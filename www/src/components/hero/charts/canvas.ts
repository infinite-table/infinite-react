'use client';

import * as React from 'react';

/**
 * Keep a canvas sized to its CSS box at device-pixel resolution. Returns the
 * CSS size (the drawing code works in CSS pixels after `setTransform(dpr)`).
 */
export function useCanvasSize(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((prev) =>
        prev.width === Math.round(width) && prev.height === Math.round(height)
          ? prev
          : { width: Math.round(width), height: Math.round(height) },
      );
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [canvasRef]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !size.width || !size.height) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(size.width * dpr);
    canvas.height = Math.round(size.height * dpr);
  }, [canvasRef, size]);

  return size;
}

/**
 * Reset the 2D context for a frame, scaled so drawing code works in CSS
 * pixels. Takes the CSS size from the ResizeObserver: reading clientWidth
 * here would force a synchronous layout of the page on every frame.
 */
export function prepareContext(
  canvas: HTMLCanvasElement,
  size: { width: number; height: number },
) {
  const ctx = canvas.getContext('2d');
  if (!ctx || !size.width) return null;
  const dpr = canvas.width / size.width;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size.width, size.height);
  return ctx;
}

/** Run `onFrame` every animation frame (optionally capped at `fps`) while active. */
export function useFrameLoop(
  active: boolean,
  onFrame: (now: number) => void,
  fps = 60,
) {
  const callback = React.useRef(onFrame);
  callback.current = onFrame;
  React.useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = 0;
    const minDelta = 1000 / fps - 2;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < minDelta) return;
      last = now;
      callback.current(now);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, fps]);
}

export type ChartPalette = {
  up: string;
  down: string;
  neutral: string;
  ink: string;
  muted: string;
  grid: string;
  surface: string;
};

/** Read the hero's chart tokens (CSS custom properties) from an element. */
export function readPalette(el: Element): ChartPalette {
  const style = getComputedStyle(el);
  const get = (name: string, fallback: string) =>
    style.getPropertyValue(name).trim() || fallback;
  return {
    up: get('--hero-up', '#13a88f'),
    down: get('--hero-down', '#e5533f'),
    neutral: get('--hero-neutral', '#383835'),
    ink: get('--hero-ink', '#ececec'),
    muted: get('--hero-muted', '#9a9a9a'),
    grid: get('--hero-grid', 'rgba(255,255,255,0.07)'),
    surface: get('--hero-surface', '#111214'),
  };
}

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** sRGB mix of two hex colors, t in 0..1. */
export function mix(a: string, b: string, t: number) {
  const [r1, g1, b1] = parseHex(a);
  const [r2, g2, b2] = parseHex(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${bl})`;
}

export function withAlpha(hex: string, alpha: number) {
  const [r, g, b] = parseHex(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

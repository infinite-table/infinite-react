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

export {
  mix,
  prepareContext,
  readPalette,
  withAlpha,
  type ChartPalette,
} from './canvasUtils';

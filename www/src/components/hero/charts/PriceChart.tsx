'use client';

import * as React from 'react';

import type { HeroFeed } from '../data/feed';
import { makeInstrument } from '../data/instruments';
import {
  readPalette,
  useCanvasSize,
  useFrameLoop,
  type ChartPalette,
} from './canvas';
import { drawPriceChart } from './drawPriceChart';

/**
 * Live price line for the selected row: one minute of 200ms samples that
 * scrolls smoothly, the open as a dashed reference, crosshair on hover.
 */
export function PriceChart({
  feed,
  selectedId,
  active,
  themeKey,
}: {
  feed: HeroFeed;
  selectedId: number;
  active: boolean;
  /** Changes when the theme does, so colors are re-read. */
  themeKey: string;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const priceRef = React.useRef<HTMLSpanElement | null>(null);
  const changeRef = React.useRef<HTMLSpanElement | null>(null);
  const tooltipRef = React.useRef<HTMLDivElement | null>(null);
  const hoverRef = React.useRef<number | null>(null);
  const paletteRef = React.useRef<ChartPalette | null>(null);
  const size = useCanvasSize(canvasRef);

  const info = React.useMemo(
    () => makeInstrument(selectedId, { price: 0, volume: 0 }),
    [selectedId],
  );

  React.useEffect(() => {
    if (canvasRef.current) paletteRef.current = readPalette(canvasRef.current);
  }, [themeKey]);

  const draw = React.useCallback(
    (now: number) =>
      drawPriceChart(
        feed,
        {
          canvas: canvasRef.current,
          size,
          palette: paletteRef.current,
          hover: hoverRef.current,
          tooltip: tooltipRef.current,
          price: priceRef.current,
          change: changeRef.current,
        },
        now,
      ),
    [feed, size],
  );

  useFrameLoop(active, draw, 60);
  // draw once when paused, so it never shows blank
  React.useEffect(() => {
    if (!active) draw(performance.now());
  }, [active, draw, selectedId, themeKey]);

  return (
    <section
      className="hero-card hero-price"
      aria-label={`Live price of ${info.symbol}`}
    >
      <header className="hero-card__header">
        <div className="hero-price__title">
          <span className="hero-card__title">{info.symbol}</span>
          <span className="hero-card__subtitle">{info.name}</span>
        </div>
        <div className="hero-price__quote">
          <span ref={priceRef} className="hero-price__last hero-num" />
          <span ref={changeRef} className="hero-price__change hero-num" />
        </div>
      </header>
      <div className="hero-price__plot">
        <canvas
          ref={canvasRef}
          className="hero-canvas"
          onPointerMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            hoverRef.current = event.clientX - rect.left;
          }}
          onPointerLeave={() => {
            hoverRef.current = null;
          }}
        />
        <div ref={tooltipRef} className="hero-tooltip" aria-hidden />
      </div>
    </section>
  );
}

'use client';

import * as React from 'react';

import type { HeroFeed } from '../data/feed';
import {
  readPalette,
  useCanvasSize,
  useFrameLoop,
  type ChartPalette,
} from './canvas';
import {
  EMPTY_HEATMAP,
  drawHeatmap,
  hitTestHeatmap,
  layoutHeatmap,
} from './heatmapLayout';

/**
 * Market heatmap: the biggest instruments, grouped by sector, sized by market
 * cap and colored by change % on a diverging scale (gray = flat). Click a tile
 * to chart it.
 */
export function Heatmap({
  feed,
  rowCount,
  active,
  themeKey,
  onSelect,
}: {
  feed: HeroFeed;
  rowCount: number;
  active: boolean;
  themeKey: string;
  onSelect: (id: number) => void;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const tooltipRef = React.useRef<HTMLDivElement | null>(null);
  const paletteRef = React.useRef<ChartPalette | null>(null);
  const hoverRef = React.useRef<number>(-1);
  const size = useCanvasSize(canvasRef);

  const tiles = React.useMemo(() => feed.topInstruments(42), [feed, rowCount]);
  const laid = React.useMemo(
    () =>
      size.width
        ? layoutHeatmap(tiles, size.width, size.height)
        : EMPTY_HEATMAP,
    [tiles, size],
  );

  React.useEffect(() => {
    if (canvasRef.current) paletteRef.current = readPalette(canvasRef.current);
  }, [themeKey]);

  const draw = React.useCallback(
    () =>
      drawHeatmap(feed, laid, {
        canvas: canvasRef.current,
        size,
        palette: paletteRef.current,
        hover: hoverRef.current,
        tooltip: tooltipRef.current,
      }),
    [feed, laid, size],
  );

  useFrameLoop(active, draw, 5);
  React.useEffect(() => {
    draw();
  }, [draw, themeKey]);

  const hitTest = (event: React.MouseEvent<HTMLCanvasElement>) =>
    hitTestHeatmap(laid, event);

  return (
    <section
      className="hero-card hero-heatmap"
      aria-label="Market heatmap by sector"
    >
      <header className="hero-card__header">
        <span className="hero-card__title">Market heatmap</span>
        <span className="hero-heatmap__legend" aria-hidden>
          <span className="hero-num">−2.5%</span>
          <span className="hero-heatmap__scale" />
          <span className="hero-num">+2.5%</span>
        </span>
      </header>
      <div className="hero-heatmap__plot">
        <canvas
          ref={canvasRef}
          className="hero-canvas"
          onPointerMove={(event) => {
            const index = hitTest(event);
            if (index !== hoverRef.current) {
              hoverRef.current = index;
              draw();
            }
          }}
          onPointerLeave={() => {
            hoverRef.current = -1;
            draw();
          }}
          onClick={(event) => {
            const tile = laid.rects[hitTest(event)];
            if (tile) onSelect(tile.id);
          }}
          style={{ cursor: 'pointer' }}
        />
        <div ref={tooltipRef} className="hero-tooltip" aria-hidden />
      </div>
    </section>
  );
}

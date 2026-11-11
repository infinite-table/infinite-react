'use client';

import * as React from 'react';

import { SERIES_INTERVAL_MS, SERIES_LENGTH, type HeroFeed } from '../data/feed';
import { makeInstrument } from '../data/instruments';
import { formatPct, formatPrice } from '../format';
import {
  prepareContext,
  readPalette,
  useCanvasSize,
  useFrameLoop,
  withAlpha,
  type ChartPalette,
} from './canvas';

const seriesScratch = new Float32Array(SERIES_LENGTH);

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
    (now: number) => {
      const canvas = canvasRef.current;
      const palette = paletteRef.current;
      if (!canvas || !palette || !size.width) return;
      const ctx = prepareContext(canvas, size);
      if (!ctx) return;
      const { width: W, height: H } = size;
      const id = feed.selectedId;
      const series = feed.selectedSeries(seriesScratch);
      const live = feed.price[id] ?? series[SERIES_LENGTH - 1];
      const open = feed.open[id] ?? live;

      let min = Math.min(live, open);
      let max = Math.max(live, open);
      for (let k = 0; k < SERIES_LENGTH; k++) {
        if (series[k] < min) min = series[k];
        if (series[k] > max) max = series[k];
      }
      const pad = (max - min) * 0.12 || live * 0.002;
      min -= pad;
      max += pad;

      const right = 52; // y-axis labels
      const top = 8;
      const bottom = 8;
      const plotW = W - right;
      const plotH = H - top - bottom;
      const step = plotW / (SERIES_LENGTH - 1);
      // smooth scroll between samples
      const progress = Math.min(
        1,
        (now - feed.seriesSampledAt) / SERIES_INTERVAL_MS,
      );
      const xAt = (k: number) => (k - progress) * step;
      const yAt = (v: number) => top + (1 - (v - min) / (max - min)) * plotH;

      // recessive grid + axis labels
      ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = palette.muted;
      ctx.strokeStyle = palette.grid;
      ctx.lineWidth = 1;
      for (let g = 0; g <= 3; g++) {
        const v = min + ((max - min) * g) / 3;
        const y = Math.round(yAt(v)) + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(plotW, y);
        ctx.stroke();
        ctx.fillText(formatPrice(v), plotW + 8, y);
      }

      // open reference
      const up = live >= open;
      const color = up ? palette.up : palette.down;
      const openY = Math.round(yAt(open)) + 0.5;
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = withAlpha(palette.muted, 0.6);
      ctx.beginPath();
      ctx.moveTo(0, openY);
      ctx.lineTo(plotW, openY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, plotW, H);
      ctx.clip();

      // area
      const gradient = ctx.createLinearGradient(0, top, 0, H);
      gradient.addColorStop(0, withAlpha(color, 0.28));
      gradient.addColorStop(1, withAlpha(color, 0));
      ctx.beginPath();
      ctx.moveTo(xAt(0), yAt(series[0]));
      for (let k = 1; k < SERIES_LENGTH; k++)
        ctx.lineTo(xAt(k), yAt(series[k]));
      ctx.lineTo(plotW, yAt(live));
      ctx.lineTo(plotW, H);
      ctx.lineTo(xAt(0), H);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // line
      ctx.beginPath();
      ctx.moveTo(xAt(0), yAt(series[0]));
      for (let k = 1; k < SERIES_LENGTH; k++)
        ctx.lineTo(xAt(k), yAt(series[k]));
      ctx.lineTo(plotW, yAt(live));
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.restore();

      // live marker: dot with a surface ring
      const liveY = yAt(live);
      ctx.beginPath();
      ctx.arc(plotW, liveY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = palette.surface;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(plotW, liveY, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // crosshair
      const hover = hoverRef.current;
      const tooltip = tooltipRef.current;
      if (hover != null && hover < plotW) {
        const k = Math.max(
          0,
          Math.min(SERIES_LENGTH - 1, Math.round(hover / step + progress)),
        );
        const x = xAt(k);
        const y = yAt(series[k]);
        ctx.strokeStyle = withAlpha(palette.ink, 0.35);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.round(x) + 0.5, top);
        ctx.lineTo(Math.round(x) + 0.5, H - bottom);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        if (tooltip) {
          const secondsAgo =
            ((SERIES_LENGTH - 1 - k) * SERIES_INTERVAL_MS) / 1000;
          tooltip.textContent = `${formatPrice(series[k])} · ${
            secondsAgo ? `−${secondsAgo.toFixed(1)}s` : 'now'
          }`;
          tooltip.style.transform = `translate(${Math.min(
            x + 8,
            plotW - 110,
          )}px, ${Math.max(0, y - 28)}px)`;
          tooltip.style.opacity = '1';
        }
      } else if (tooltip) {
        tooltip.style.opacity = '0';
      }

      if (priceRef.current) priceRef.current.textContent = formatPrice(live);
      if (changeRef.current) {
        const pct = ((live - open) / open) * 100;
        changeRef.current.textContent = formatPct(pct);
        changeRef.current.dataset.tone = pct >= 0 ? 'up' : 'down';
      }
    },
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

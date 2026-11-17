import { SERIES_INTERVAL_MS, SERIES_LENGTH, type HeroFeed } from '../data/feed';
import { formatPct, formatPrice } from '../format';
import { prepareContext, withAlpha, type ChartPalette } from './canvasUtils';

const seriesScratch = new Float32Array(SERIES_LENGTH);

export type PriceChartTarget = {
  canvas: HTMLCanvasElement | null;
  /** The CSS size of the canvas. */
  size: { width: number; height: number };
  palette: ChartPalette | null;
  /** The pointer's x inside the canvas, or null. */
  hover: number | null;
  tooltip: HTMLElement | null;
  /** Elements that get the last price and the change %, as text. */
  price: HTMLElement | null;
  change: HTMLElement | null;
};

/**
 * One frame of the live price line of the feed's selected row: one minute of
 * 200ms samples that scrolls smoothly, the open as a dashed reference, a
 * crosshair on hover. No framework code: the React and the Vue chart call it.
 */
export function drawPriceChart(
  feed: HeroFeed,
  target: PriceChartTarget,
  now: number,
) {
  const { canvas, palette, size } = target;
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
  for (let k = 1; k < SERIES_LENGTH; k++) ctx.lineTo(xAt(k), yAt(series[k]));
  ctx.lineTo(plotW, yAt(live));
  ctx.lineTo(plotW, H);
  ctx.lineTo(xAt(0), H);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // line
  ctx.beginPath();
  ctx.moveTo(xAt(0), yAt(series[0]));
  for (let k = 1; k < SERIES_LENGTH; k++) ctx.lineTo(xAt(k), yAt(series[k]));
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
  const hover = target.hover;
  const tooltip = target.tooltip;
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
      const secondsAgo = ((SERIES_LENGTH - 1 - k) * SERIES_INTERVAL_MS) / 1000;
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

  if (target.price) target.price.textContent = formatPrice(live);
  if (target.change) {
    const pct = ((live - open) / open) * 100;
    target.change.textContent = formatPct(pct);
    target.change.dataset.tone = pct >= 0 ? 'up' : 'down';
  }
}

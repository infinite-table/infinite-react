import type { HeatTile, HeroFeed } from '../data/feed';
import { SECTORS } from '../data/instruments';
import { formatCap, formatPct } from '../format';
import { mix, prepareContext, type ChartPalette } from './canvasUtils';

type Rect = { x: number; y: number; w: number; h: number };
type Laid<T> = T & Rect;

/** Squarified treemap (Bruls et al.): lays `items` into `rect` by `value`. */
function squarify<T extends { value: number }>(
  items: T[],
  rect: Rect,
): Laid<T>[] {
  const out: Laid<T>[] = [];
  const total = items.reduce((acc, item) => acc + item.value, 0);
  if (!total || rect.w <= 0 || rect.h <= 0) return out;
  const scale = (rect.w * rect.h) / total;
  const queue = items.map((item) => ({ item, area: item.value * scale }));
  let { x, y, w, h } = rect;

  const worst = (row: { area: number }[], side: number) => {
    const sum = row.reduce((acc, r) => acc + r.area, 0);
    let max = 0;
    let min = Infinity;
    for (const r of row) {
      max = Math.max(max, r.area);
      min = Math.min(min, r.area);
    }
    const s2 = side * side;
    const sum2 = sum * sum;
    return Math.max((s2 * max) / sum2, sum2 / (s2 * min));
  };

  while (queue.length) {
    const side = Math.min(w, h);
    const row = [queue.shift()!];
    while (
      queue.length &&
      worst([...row, queue[0]], side) <= worst(row, side)
    ) {
      row.push(queue.shift()!);
    }
    const sum = row.reduce((acc, r) => acc + r.area, 0);
    if (w >= h) {
      const rowW = sum / h;
      let cy = y;
      for (const r of row) {
        const rh = r.area / rowW;
        out.push({ ...r.item, x, y: cy, w: rowW, h: rh });
        cy += rh;
      }
      x += rowW;
      w -= rowW;
    } else {
      const rowH = sum / w;
      let cx = x;
      for (const r of row) {
        const rw = r.area / rowH;
        out.push({ ...r.item, x: cx, y, w: rw, h: rowH });
        cx += rw;
      }
      y += rowH;
      h -= rowH;
    }
  }
  return out;
}

export type HeatmapLayout = { blocks: SectorBlock[]; rects: TileRect[] };

type SectorBlock = Laid<{ sector: number; value: number }>;
type TileRect = Laid<HeatTile & { value: number }>;

const GAP = 2;
const SECTOR_LABEL = 13;

/** Sector blocks, and the tiles inside them, for a canvas of this size. */
export function layoutHeatmap(
  tiles: HeatTile[],
  width: number,
  height: number,
) {
  const bySector = new Map<number, HeatTile[]>();
  for (const tile of tiles) {
    const list = bySector.get(tile.sector) ?? [];
    list.push(tile);
    bySector.set(tile.sector, list);
  }
  const sectorItems = [...bySector.entries()]
    .map(([sector, list]) => ({
      sector,
      value: list.reduce((acc, t) => acc + Math.sqrt(t.cap), 0),
    }))
    .sort((a, b) => b.value - a.value);
  const blocks = squarify(sectorItems, { x: 0, y: 0, w: width, h: height });
  const rects: TileRect[] = [];
  for (const block of blocks) {
    const showLabel = block.h > 40 && block.w > 54;
    const inner: Rect = {
      x: block.x + GAP / 2,
      y: block.y + GAP / 2 + (showLabel ? SECTOR_LABEL : 0),
      w: block.w - GAP,
      h: block.h - GAP - (showLabel ? SECTOR_LABEL : 0),
    };
    const list = (bySector.get(block.sector) ?? [])
      // sqrt keeps megacaps from swallowing the map
      .map((tile) => ({ ...tile, value: Math.sqrt(tile.cap) }))
      .sort((a, b) => b.value - a.value);
    rects.push(...squarify(list, inner));
  }
  return { blocks: blocks as SectorBlock[], rects };
}

export const EMPTY_HEATMAP: HeatmapLayout = { blocks: [], rects: [] };

/** The index of the tile under a pointer event on the canvas, or -1. */
export function hitTestHeatmap(
  laid: HeatmapLayout,
  event: {
    clientX: number;
    clientY: number;
    currentTarget: EventTarget | null;
  },
) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return laid.rects.findIndex(
    (t) => x >= t.x && x < t.x + t.w && y >= t.y && y < t.y + t.h,
  );
}

export type HeatmapTarget = {
  canvas: HTMLCanvasElement | null;
  /** The CSS size of the canvas. */
  size: { width: number; height: number };
  palette: ChartPalette | null;
  /** The index of the hovered tile, or -1. */
  hover: number;
  tooltip: HTMLElement | null;
};

/**
 * Draws the heatmap: tiles colored by change % on a diverging scale (gray =
 * flat). No framework code: the React and the Vue chart call it.
 */
export function drawHeatmap(
  feed: HeroFeed,
  laid: HeatmapLayout,
  target: HeatmapTarget,
) {
  const { canvas, palette, size } = target;
  if (!canvas || !palette || !size.width) return;
  const ctx = prepareContext(canvas, size);
  if (!ctx) return;
  const LIMIT = 2.5; // ±2.5% saturates the scale
  ctx.textBaseline = 'top';

  for (const block of laid.blocks) {
    if (block.h > 40 && block.w > 54) {
      ctx.font = '600 9.5px ui-sans-serif, system-ui, sans-serif';
      ctx.fillStyle = palette.muted;
      ctx.fillText(
        SECTORS[block.sector].toUpperCase(),
        block.x + 3,
        block.y + 3,
        block.w - 6,
      );
    }
  }

  laid.rects.forEach((tile, index) => {
    const pct = feed.changePctOf(tile.id);
    const t = Math.min(1, Math.abs(pct) / LIMIT);
    ctx.fillStyle = mix(
      palette.neutral,
      pct >= 0 ? palette.up : palette.down,
      0.25 + 0.75 * t,
    );
    const x = tile.x + GAP / 2;
    const y = tile.y + GAP / 2;
    const w = Math.max(0, tile.w - GAP);
    const h = Math.max(0, tile.h - GAP);
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 3);
    ctx.fill();
    if (index === target.hover) {
      ctx.strokeStyle = palette.ink;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    if (w > 26 && h > 15) {
      const big = w > 64 && h > 34;
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.font = `600 ${big ? 11 : 9}px ui-sans-serif, system-ui, sans-serif`;
      ctx.fillText(tile.symbol, x + 3, y + (big ? 4 : 3), w - 6);
      if (h > 34) {
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = '500 9.5px ui-monospace, SFMono-Regular, Menlo, monospace';
        ctx.fillText(formatPct(pct), x + 4, y + 18, w - 8);
      }
    }
  });

  const hover = laid.rects[target.hover];
  const tooltip = target.tooltip;
  if (tooltip) {
    if (hover) {
      tooltip.textContent = `${hover.symbol} · ${formatPct(
        feed.changePctOf(hover.id),
      )} · ${formatCap(hover.cap)}`;
      tooltip.style.transform = `translate(${Math.min(
        hover.x + 6,
        size.width - 170,
      )}px, ${Math.max(0, hover.y - 26)}px)`;
      tooltip.style.opacity = '1';
    } else {
      tooltip.style.opacity = '0';
    }
  }
}

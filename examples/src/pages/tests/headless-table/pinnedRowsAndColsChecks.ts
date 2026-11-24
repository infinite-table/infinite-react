import type { Page } from '@playwright/test';

import { COLS, FIXED, ROWS, colWidth, rowHeight } from './pinnedRowsAndColsData';

const CONFIG = {
  ...FIXED,
  rows: ROWS,
  cols: COLS,
  colWidths: Array.from({ length: COLS }, (_, i) => colWidth(i)),
  rowHeights: Array.from({ length: ROWS }, (_, i) => rowHeight(i)),
};

export type ScrollPos = { scrollLeft: number; scrollTop: number };

/**
 * Where every cell should be, computed from the sizes, the pinning and the
 * scroll position (not read from the DOM), checked against:
 *  - every rendered cell (position, size)
 *  - what is on top: the center of every visible slot must hit its cell,
 *    so pinned cells cover the scrolled ones, the corners cover the pinned
 *    rows and columns, and nothing is missing
 */
export function getLayoutErrors(page: Page) {
  return page.evaluate((config) => {
    const errors: string[] = [];
    const target = document.querySelector<HTMLElement>(
      '#host [data-name="scroll-transform-target"]',
    );
    if (!target) {
      return ['no scroll layer'];
    }
    const scroller = target.parentElement!;
    const box = scroller.getBoundingClientRect();
    const W = scroller.clientWidth;
    const H = scroller.clientHeight;
    const { scrollLeft, scrollTop } = scroller;

    const offsets = (sizes: number[]) => {
      const result = [0];
      sizes.forEach((size, i) => result.push(result[i] + size));
      return result;
    };
    const colOffsets = offsets(config.colWidths);
    const rowOffsets = offsets(config.rowHeights);

    const pinnedStartWidth = colOffsets[config.fixedColsStart];
    const pinnedEndWidth =
      colOffsets[config.cols] - colOffsets[config.cols - config.fixedColsEnd];
    const pinnedStartHeight = rowOffsets[config.fixedRowsStart];
    const pinnedEndHeight =
      rowOffsets[config.rows] - rowOffsets[config.rows - config.fixedRowsEnd];

    // position relative to the viewport of the grid, and the band of the
    // viewport the cell shows in (where it is not covered by pinned ones)
    const place = (
      index: number,
      offsetsOf: number[],
      count: number,
      fixedStart: number,
      fixedEnd: number,
      viewport: number,
      scroll: number,
      startSize: number,
      endSize: number,
    ) => {
      const size = offsetsOf[index + 1] - offsetsOf[index];
      if (index < fixedStart) {
        const pos = offsetsOf[index];
        return { pos, size, band: [pos, pos + size] };
      }
      if (index >= count - fixedEnd) {
        const pos = viewport - (offsetsOf[count] - offsetsOf[index]);
        return { pos, size, band: [pos, pos + size] };
      }
      const pos = offsetsOf[index] - scroll;
      return {
        pos,
        size,
        band: [
          Math.max(pos, startSize),
          Math.min(pos + size, viewport - endSize),
        ],
      };
    };
    const placeCol = (c: number) =>
      place(
        c,
        colOffsets,
        config.cols,
        config.fixedColsStart,
        config.fixedColsEnd,
        W,
        scrollLeft,
        pinnedStartWidth,
        pinnedEndWidth,
      );
    const placeRow = (r: number) =>
      place(
        r,
        rowOffsets,
        config.rows,
        config.fixedRowsStart,
        config.fixedRowsEnd,
        H,
        scrollTop,
        pinnedStartHeight,
        pinnedEndHeight,
      );

    const close = (a: number, b: number) => Math.abs(a - b) <= 0.5;

    // 1. every rendered cell
    let rendered = 0;
    target
      .querySelectorAll<HTMLElement>('[data-cell]:not(.InfiniteDetachedCell)')
      .forEach((cell) => {
        rendered++;
        const [r, c] = cell.dataset.cell!.split(',').map(Number);
        const col = placeCol(c);
        const row = placeRow(r);
        const rect = cell.getBoundingClientRect();
        const actual = [
          rect.left - box.left,
          rect.top - box.top,
          rect.width,
          rect.height,
        ];
        const expected = [col.pos, row.pos, col.size, row.size];
        if (!actual.every((value, i) => close(value, expected[i]))) {
          errors.push(
            `cell ${r},${c}: at ${actual
              .map(Math.round)
              .join(' ')} (x y w h), expected ${expected
              .map(Math.round)
              .join(' ')}`,
          );
        }
      });
    if (!rendered) {
      errors.push('no cells rendered');
    }

    // 2. what is on top, at the center of every visible slot
    const visible = (
      count: number,
      placeOf: typeof placeCol,
      viewport: number,
    ) => {
      const result: { index: number; center: number }[] = [];
      for (let i = 0; i < count; i++) {
        const [start, end] = placeOf(i).band;
        const from = Math.max(start, 0);
        const to = Math.min(end, viewport);
        if (to - from >= 2) {
          result.push({ index: i, center: (from + to) / 2 });
        }
      }
      return result;
    };
    const visibleCols = visible(config.cols, placeCol, W);
    const visibleRows = visible(config.rows, placeRow, H);

    for (const row of visibleRows) {
      for (const col of visibleCols) {
        const hit = document
          .elementFromPoint(box.left + col.center, box.top + row.center)
          ?.closest<HTMLElement>('[data-cell]');
        const expected = `${row.index},${col.index}`;
        if (hit?.dataset.cell !== expected) {
          errors.push(
            `at the center of the slot of ${expected}: found ${
              hit?.dataset.cell ?? 'no cell'
            }`,
          );
        }
      }
    }

    return errors.slice(0, 20);
  }, CONFIG);
}

function getScroller(page: Page) {
  return page.locator('#host [data-name="scroll-transform-target"] >> xpath=..');
}

export async function scrollGridTo(page: Page, position: ScrollPos) {
  await getScroller(page).evaluate((scroller, position) => {
    scroller.scrollLeft = position.scrollLeft;
    scroller.scrollTop = position.scrollTop;
  }, position);
}

export function getScrollPosition(page: Page): Promise<ScrollPos> {
  return getScroller(page).evaluate((scroller) => ({
    scrollLeft: scroller.scrollLeft,
    scrollTop: scroller.scrollTop,
  }));
}

export function getScrollMax(page: Page) {
  return getScroller(page).evaluate((scroller) => ({
    scrollLeftMax: scroller.scrollWidth - scroller.clientWidth,
    scrollTopMax: scroller.scrollHeight - scroller.clientHeight,
  }));
}

/** the edges, one pixel off the edges, and positions in between */
export function getScrollPositions(max: {
  scrollLeftMax: number;
  scrollTopMax: number;
}): ScrollPos[] {
  const { scrollLeftMax, scrollTopMax } = max;
  const lefts = [
    0,
    1,
    137,
    Math.round(scrollLeftMax / 2),
    scrollLeftMax - 1,
    scrollLeftMax,
  ];
  const tops = [
    0,
    1,
    333,
    Math.round(scrollTopMax / 2),
    scrollTopMax - 1,
    scrollTopMax,
  ];
  return tops.flatMap((scrollTop) =>
    lefts.map((scrollLeft) => ({ scrollLeft, scrollTop })),
  );
}

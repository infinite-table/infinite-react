/**
 * @jest-environment jsdom
 *
 * The Vue HeadlessTable used on its own (no InfiniteTable around it), with
 * rows and columns pinned at both ends: nobody sets the CSS vars that
 * InfiniteTable uses to position the cells, so the renderer created by
 * RawTable positions them itself (GridRenderer.ownsPositionVars).
 *
 * jsdom has no layout, so this checks the styles the renderer writes. The
 * layout itself is checked in the browser, by the React sibling test page
 * (examples/src/pages/tests/headless-table/pinned-rows-and-cols).
 */
import { createApp, h, nextTick } from 'vue';
import type { App } from 'vue';

import { MatrixBrain } from '../VirtualBrain/MatrixBrain';
import { HeadlessTable } from './HeadlessTableForVue.vue';
import {
  currentTransformY,
  scrollLeftCSSVar,
  scrollTopCSSVar,
} from './ReactHeadlessTableRenderer';
import type { Renderable } from '../types/Renderable';
import type { TableRenderCellFnParam } from './rendererTypes';

const ROW_HEIGHT = 30;
const COL_WIDTH = 100;
const VIEWPORT_HEIGHT = 300;
const VIEWPORT_WIDTH = 700;
const ROWS = 100;
const COLS = 20;

// jsdom has no ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as any).ResizeObserver = ResizeObserverMock;

const renderCell = (param: TableRenderCellFnParam) => {
  const { rowIndex, colIndex, domRef, widthWithColspan, heightWithRowspan } =
    param;

  return h(
    'div',
    {
      ref: domRef as any,
      'data-cell': `${rowIndex}-${colIndex}`,
      style: {
        width: `${widthWithColspan}px`,
        height: `${heightWithRowspan}px`,
      },
    },
    `${rowIndex},${colIndex}`,
  ) as unknown as Renderable;
};

async function flush() {
  await nextTick();
  await new Promise((resolve) => setTimeout(resolve, 30));
  await nextTick();
}

describe('Vue HeadlessTable on its own, with pinned rows and columns', () => {
  let container: HTMLElement;
  let app: App | null = null;
  let brain: MatrixBrain;
  let scrollerElement: HTMLElement | null = null;

  const getCell = (rowIndex: number, colIndex: number) =>
    container.querySelector<HTMLElement>(
      `[data-cell="${rowIndex}-${colIndex}"]`,
    )!;

  // what the renderer wrote: x in the transform, y in a CSS var
  const getPosition = (rowIndex: number, colIndex: number) => {
    const cell = getCell(rowIndex, colIndex);
    if (!cell) {
      throw new Error(
        `no cell ${rowIndex}-${colIndex}, rendered: ${JSON.stringify(
          brain.getRenderRange(),
        )}`,
      );
    }
    const x = cell.style.transform.match(/^translate3d\((.*), var\(/)?.[1];
    return {
      x,
      y: cell.style.getPropertyValue(currentTransformY),
      zIndex: cell.style.zIndex,
    };
  };

  const fixedX = (x: number) =>
    `calc( ${x}px + var(${scrollLeftCSSVar}, 0px) )`;
  const fixedY = (y: number) => `calc( ${y}px + var(${scrollTopCSSVar}, 0px) )`;

  beforeEach(async () => {
    container = document.createElement('div');
    document.body.appendChild(container);

    brain = new MatrixBrain('vue-headless-table-pinned-test');
    brain.updateFixedCells({
      fixedRowsStart: 2,
      fixedRowsEnd: 2,
      fixedColsStart: 2,
      fixedColsEnd: 2,
    });
    brain.update({
      width: VIEWPORT_WIDTH,
      height: VIEWPORT_HEIGHT,
      cols: COLS,
      rows: ROWS,
      colWidth: COL_WIDTH,
      rowHeight: ROW_HEIGHT,
    });

    app = createApp({
      render: () =>
        h(HeadlessTable, {
          brain,
          renderCell,
          scrollerRef: (el) => {
            scrollerElement = el;
          },
        }),
    });
    app.mount(container);
    await flush();
  });

  afterEach(() => {
    app?.unmount();
    app = null;
    brain.destroy();
    container.remove();
    scrollerElement = null;
  });

  it('positions the cells from the brain, the pinned ones relative to the viewport', () => {
    // scrolled cells: their content offset
    expect(getPosition(5, 3)).toMatchObject({ x: '300px', y: '150px' });

    // pinned at the start, pinned at the end (relative to the viewport,
    // plus the scroll position)
    expect(getPosition(5, 1)).toMatchObject({ x: fixedX(100), y: '150px' });
    expect(getPosition(5, 19)).toMatchObject({ x: fixedX(600), y: '150px' });
    expect(getPosition(1, 3)).toMatchObject({ x: '300px', y: fixedY(30) });
    expect(getPosition(99, 3)).toMatchObject({ x: '300px', y: fixedY(270) });

    // the corners
    expect(getPosition(0, 0)).toMatchObject({ x: fixedX(0), y: fixedY(0) });
    expect(getPosition(99, 19)).toMatchObject({
      x: fixedX(600),
      y: fixedY(270),
    });
  });

  it('puts the pinned cells above the scrolled ones, and the corners above all', () => {
    const zIndex = (rowIndex: number, colIndex: number) =>
      Number(getPosition(rowIndex, colIndex).zIndex) || 0;

    const scrolled = zIndex(5, 3);
    const pinned = [zIndex(5, 1), zIndex(5, 19), zIndex(1, 3), zIndex(99, 3)];
    const corners = [
      zIndex(0, 0),
      zIndex(0, 19),
      zIndex(99, 0),
      zIndex(99, 19),
    ];

    pinned.forEach((value) => expect(value).toBeGreaterThan(scrolled));
    corners.forEach((value) =>
      expect(value).toBeGreaterThan(Math.max(...pinned)),
    );
  });

  it('sets the scroll position vars on the parent of the cells, when scrolling', async () => {
    const transformTarget = container.querySelector<HTMLElement>(
      '[data-name="scroll-transform-target"]',
    )!;
    expect(getCell(0, 0).parentElement).toBe(transformTarget);

    Object.defineProperty(scrollerElement!, 'scrollTop', {
      value: 600,
      writable: true,
    });
    Object.defineProperty(scrollerElement!, 'scrollLeft', {
      value: 250,
      writable: true,
    });
    scrollerElement!.dispatchEvent(new Event('scroll'));
    await flush();

    expect(transformTarget.style.getPropertyValue(scrollLeftCSSVar)).toBe(
      '250px',
    );
    expect(transformTarget.style.getPropertyValue(scrollTopCSSVar)).toBe(
      '600px',
    );

    // the pinned cells keep their viewport positions
    expect(getPosition(0, 0)).toMatchObject({ x: fixedX(0), y: fixedY(0) });
    expect(getPosition(99, 19)).toMatchObject({
      x: fixedX(600),
      y: fixedY(270),
    });
  });
});

/**
 * @jest-environment jsdom
 *
 * Phase 3 validation for the Vue HeadlessTable shell: scroll container +
 * transform target + RawTable + SpacePlaceholder, driven by real DOM scroll
 * events end-to-end (scroll event -> brain -> renderer -> cell updates +
 * transform).
 */
import { createApp, h, nextTick } from 'vue';
import type { App } from 'vue';

import { MatrixBrain } from '../VirtualBrain/MatrixBrain';
import { HeadlessTable } from './HeadlessTableForVue.vue';
import type { Renderable } from '../types/Renderable';
import type { TableRenderCellFnParam } from './rendererTypes';

const ROW_HEIGHT = 30;
const COL_WIDTH = 100;
const VIEWPORT_HEIGHT = 300;
const VIEWPORT_WIDTH = 400;
const ROWS = 100;
const COLS = 10;

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

describe('Vue HeadlessTable shell', () => {
  let container: HTMLElement;
  let app: App | null = null;
  let brain: MatrixBrain;
  let scrollerElement: HTMLElement | null = null;

  beforeEach(async () => {
    container = document.createElement('div');
    document.body.appendChild(container);

    brain = new MatrixBrain('vue-headless-table-test');
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

  it('renders the scroll container, transform target, cells and the scroll-size placeholder', () => {
    expect(scrollerElement).not.toBeNull();
    expect(scrollerElement!.className).toContain(
      'InfiniteVirtualScrollContainer',
    );

    const transformTarget = container.querySelector(
      '[data-name="scroll-transform-target"]',
    );
    expect(transformTarget).not.toBeNull();

    // cells are rendered inside the transform target
    const cells = transformTarget!.querySelectorAll('[data-cell]');
    expect(cells.length).toBeGreaterThan(0);

    // placeholder is sized to the full virtualized content
    const placeholder = container.querySelector(
      '[data-name="SpacePlaceholder"]',
    ) as HTMLElement;
    expect(placeholder).not.toBeNull();
    expect(placeholder.style.height).toBe(`${ROWS * ROW_HEIGHT}px`);
    expect(placeholder.style.width).toBe(`${COLS * COL_WIDTH}px`);
  });

  it('DOM scroll events drive the brain: new render range + transform update', async () => {
    const cellIds = () =>
      Array.from(container.querySelectorAll('[data-cell]')).map((el) =>
        el.getAttribute('data-cell'),
      );

    expect(cellIds()).toContain('0-0');

    // simulate a user scroll
    const scrollTop = 20 * ROW_HEIGHT;
    Object.defineProperty(scrollerElement!, 'scrollTop', {
      value: scrollTop,
      writable: true,
    });
    scrollerElement!.dispatchEvent(new Event('scroll'));

    await flush();

    const [startRow] = brain.getRenderRange().start;
    expect(startRow).toBeGreaterThanOrEqual(19);
    expect(cellIds()).toContain(`${startRow}-0`);
    expect(cellIds()).not.toContain('0-0');

    // the transform target was translated (in a raf) to follow the scroll
    const transformTarget = container.querySelector(
      '[data-name="scroll-transform-target"]',
    ) as HTMLElement;
    expect(transformTarget.style.transform).toBe(
      `translate3d(0px, -${scrollTop}px, 0px)`,
    );
  });
});

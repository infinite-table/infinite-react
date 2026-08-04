/**
 * @jest-environment jsdom
 *
 * Phase 2 validation for the Vue rendering bridge: mounts the Vue RawTable
 * over a real MatrixBrain + shared GridRenderer with Vue cell pools, and
 * verifies that virtualization, cell pooling and scroll-driven updates work
 * end-to-end in a real (jsdom) DOM.
 */
import { createApp, h, nextTick } from 'vue';
import type { App } from 'vue';

import { MatrixBrain } from '../VirtualBrain/MatrixBrain';
import { RawTable } from './RawTableForVue.vue';
import { createRenderer } from './createRenderer.vue';
import { RenderSlot } from '../RawList/RenderSlot.vue';
import { buildSubscriptionCallback } from '../utils/buildSubscriptionCallback';
import type { Renderable } from '../types/Renderable';
import type { TableRenderCellFnParam } from './rendererTypes';

const ROW_HEIGHT = 30;
const COL_WIDTH = 100;
const VIEWPORT_HEIGHT = 300;
const VIEWPORT_WIDTH = 400;

const renderCell = (param: TableRenderCellFnParam) => {
  const { rowIndex, colIndex, domRef, widthWithColspan, heightWithRowspan } =
    param;

  return h(
    'div',
    {
      // Vue function refs receive Element | ComponentPublicInstance | null;
      // for plain element vnodes this is the HTMLElement the cell ref expects
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

function getRenderedCellIds(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('[data-cell]')).map(
    (el) => el.getAttribute('data-cell')!,
  );
}

async function flush() {
  await nextTick();
  // one macrotask, for any requestAnimationFrame-deferred work
  await new Promise((resolve) => setTimeout(resolve, 30));
  await nextTick();
}

describe('Vue rendering bridge (RawTable + GridRenderer + Vue pools)', () => {
  let container: HTMLElement;
  let app: App | null = null;
  let brain: MatrixBrain;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    brain = new MatrixBrain('vue-bridge-test');
    brain.update({
      width: VIEWPORT_WIDTH,
      height: VIEWPORT_HEIGHT,
      cols: 10,
      rows: 100,
      colWidth: COL_WIDTH,
      rowHeight: ROW_HEIGHT,
    });
  });

  afterEach(() => {
    app?.unmount();
    app = null;
    brain.destroy();
    container.remove();
  });

  it('renders the virtualized render range into the DOM', async () => {
    const { renderer, onRenderUpdater } = createRenderer(brain);

    app = createApp({
      render: () =>
        h(RawTable, {
          brain,
          renderer,
          onRenderUpdater,
          renderCell,
          cellDetachedClassNames: ['detached'],
        }),
    });
    app.mount(container);

    await flush();

    const cellIds = getRenderedCellIds(container);

    // the top-left cell of the viewport must be rendered
    expect(cellIds).toContain('0-0');

    const renderRange = brain.getRenderRange();
    const [startRow, startCol] = renderRange.start;
    const [endRow, endCol] = renderRange.end;

    // every cell in the brain's render range is present in the DOM
    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        expect(cellIds).toContain(`${row}-${col}`);
      }
    }

    // virtualization: cells far outside the viewport are NOT rendered
    expect(cellIds).not.toContain('50-0');
    expect(cellIds.length).toBeLessThan(100);

    // the function refs must have fired (ref-owner adoption in RenderSlot),
    // so the renderer could position the cell elements via transforms
    const cellElements = Array.from(
      container.querySelectorAll('[data-cell]'),
    ) as HTMLElement[];
    const positioned = cellElements.filter((el) =>
      el.style.transform.includes('translate3d'),
    );
    expect(positioned.length).toBe(cellElements.length);
  });

  it('updates cells in place when scrolling (pool reuse, no remounts)', async () => {
    const { renderer, onRenderUpdater } = createRenderer(brain);

    app = createApp({
      render: () =>
        h(RawTable, {
          brain,
          renderer,
          onRenderUpdater,
          renderCell,
          cellDetachedClassNames: ['detached'],
        }),
    });
    app.mount(container);

    await flush();

    const initialCellElements = new Set(
      Array.from(container.querySelectorAll('[data-cell]')),
    );
    expect(getRenderedCellIds(container)).toContain('0-0');

    brain.setScrollPosition({ scrollTop: 20 * ROW_HEIGHT, scrollLeft: 0 });

    await flush();

    const cellIds = getRenderedCellIds(container);
    const [startRow] = brain.getRenderRange().start;

    expect(startRow).toBeGreaterThanOrEqual(19);
    // the new range start is rendered, the old top-left cell is gone
    expect(cellIds).toContain(`${startRow}-0`);
    expect(cellIds).not.toContain('0-0');

    // cells were reused (updated through their own RenderSlot), so the
    // same DOM elements now host the new content
    const cellElementsAfterScroll = Array.from(
      container.querySelectorAll('[data-cell]'),
    );
    const reused = cellElementsAfterScroll.filter((el) =>
      initialCellElements.has(el),
    );
    expect(reused.length).toBeGreaterThan(0);
  });

  it('grows the rendered range when the viewport grows', async () => {
    const { renderer, onRenderUpdater } = createRenderer(brain);

    app = createApp({
      render: () =>
        h(RawTable, {
          brain,
          renderer,
          onRenderUpdater,
          renderCell,
          cellDetachedClassNames: ['detached'],
        }),
    });
    app.mount(container);

    await flush();

    const countBefore = getRenderedCellIds(container).length;

    brain.update({ height: VIEWPORT_HEIGHT * 2 });

    await flush();

    const countAfter = getRenderedCellIds(container).length;
    expect(countAfter).toBeGreaterThan(countBefore);
  });
});

describe('RenderSlot (Vue AvoidReactDiff sibling)', () => {
  it('re-renders only from updater pushes, including pre-mount updates', async () => {
    const updater = buildSubscriptionCallback<Renderable>();

    const container = document.createElement('div');
    document.body.appendChild(container);

    updater(h('span', { id: 'first' }, 'first') as unknown as Renderable);

    const app = createApp({
      render: () => h(RenderSlot, { updater }),
    });
    app.mount(container);

    await nextTick();
    expect(container.querySelector('#first')!.textContent).toBe('first');

    updater(h('span', { id: 'second' }, 'second') as unknown as Renderable);

    await nextTick();
    expect(container.querySelector('#first')).toBeNull();
    expect(container.querySelector('#second')!.textContent).toBe('second');

    app.unmount();
    container.remove();
  });

  it('calls afterCommit after DOM patches', async () => {
    const updater = buildSubscriptionCallback<Renderable>();
    const afterCommit = jest.fn();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      render: () => h(RenderSlot, { updater, afterCommit }),
    });
    app.mount(container);

    await nextTick();
    const callsAfterMount = afterCommit.mock.calls.length;
    expect(callsAfterMount).toBeGreaterThanOrEqual(1);

    updater(h('i', 'content') as unknown as Renderable);
    await nextTick();

    expect(afterCommit.mock.calls.length).toBeGreaterThan(callsAfterMount);
    // afterCommit fired after the DOM was patched
    expect(container.querySelector('i')).not.toBeNull();

    app.unmount();
    container.remove();
  });
});

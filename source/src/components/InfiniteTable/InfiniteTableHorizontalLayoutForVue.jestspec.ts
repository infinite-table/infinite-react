/**
 * @jest-environment jsdom
 *
 * Phase 3d validation: horizontal layout (wrapRowsHorizontally) for the Vue
 * table.
 *
 * - wrapRowsHorizontally creates a HorizontalLayoutMatrixBrain and applies
 *   the horizontal-layout css class on the root
 * - cells render with the page-aware row indexes
 * - toggling the prop at runtime recreates the brains + renderers
 *   (useToggleWrapRowsHorizontally port)
 */
import { createApp, defineComponent, h, nextTick, shallowRef } from 'vue';
import type { App } from 'vue';

import { DataSource } from '../DataSource/DataSourceForVue.vue';
import { InfiniteTable } from './InfiniteTableForVue.vue';
import { rootClassName } from './internalProps';

type Person = {
  id: number;
  name: string;
};

const VIEWPORT = { width: 600, height: 120 };
const ROW_HEIGHT = 40;

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as any).ResizeObserver = ResizeObserverMock;

async function flush(ms = 30) {
  await nextTick();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, ms));
  await nextTick();
}

const people: Person[] = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  name: `person-${i}`,
}));

describe('Vue InfiniteTable horizontal layout', () => {
  let container: HTMLElement;
  let app: App | null = null;
  let wrapRef = shallowRef(true);

  const mount = async (wrap: boolean) => {
    container = document.createElement('div');
    document.body.appendChild(container);
    wrapRef = shallowRef(wrap);

    const Root = defineComponent({
      setup() {
        return () =>
          h(DataSource, { primaryKey: 'id', data: people } as any, {
            default: () =>
              h(InfiniteTable, {
                columns: {
                  name: { field: 'name', header: 'Name', defaultWidth: 100 },
                },
                rowHeight: ROW_HEIGHT,
                wrapRowsHorizontally: wrapRef.value,
              } as any),
          });
      },
    });

    app = createApp(Root);
    app.mount(container);
    await flush();

    const getState = (globalThis as any).getState;
    const actions = (globalThis as any).componentActions;
    actions.bodySize = { ...VIEWPORT };
    getState().brain.update(VIEWPORT);
    await flush();

    return { getState, actions };
  };

  afterEach(async () => {
    app?.unmount();
    app = null;
    container.remove();
    await flush(10);
  });

  const rootEl = () =>
    container.querySelector(`.${rootClassName}`) as HTMLElement;

  const cellTexts = () =>
    Array.from(container.querySelectorAll('[data-column-id="name"]'))
      .map((el) => el.textContent?.trim())
      .filter((text) => text && text.startsWith('person-'));

  test('wrapRowsHorizontally renders a horizontal-layout brain and css class', async () => {
    const { getState } = await mount(true);

    expect(getState().brain.isHorizontalLayoutBrain).toBe(true);
    expect(
      rootEl().className.includes(`${rootClassName}--horizontal-layout`),
    ).toBe(true);

    // viewport is 120px tall -> 3 rows of 40px per page; 600px wide and
    // 100px columns -> multiple pages fit, so more rows render than would
    // fit vertically
    await flush(50);
    const rendered = cellTexts();
    expect(rendered.length).toBeGreaterThan(3);
    expect(rendered).toContain('person-0');
    expect(rendered).toContain('person-3');
  });

  test('toggling wrapRowsHorizontally recreates the brains', async () => {
    const { getState } = await mount(false);

    const initialBrain = getState().brain;
    expect(initialBrain.isHorizontalLayoutBrain).toBe(false);

    wrapRef.value = true;
    await flush(50);

    const newBrain = getState().brain;
    expect(newBrain).not.toBe(initialBrain);
    expect(newBrain.isHorizontalLayoutBrain).toBe(true);
    expect(
      rootEl().className.includes(`${rootClassName}--horizontal-layout`),
    ).toBe(true);

    // table still renders after the brain swap
    (globalThis as any).componentActions.bodySize = { ...VIEWPORT };
    newBrain.update(VIEWPORT);
    await flush(50);
    expect(cellTexts().length).toBeGreaterThan(0);

    wrapRef.value = false;
    await flush(50);
    expect(getState().brain.isHorizontalLayoutBrain).toBe(false);
    expect(
      rootEl().className.includes(`${rootClassName}--horizontal-layout`),
    ).toBe(false);
  });
});

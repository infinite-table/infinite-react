/**
 * @jest-environment jsdom
 *
 * The public Vue entry (src/index.vue.tsx):
 *
 * - names that are shared with the React entry are exported from the Vue
 *   entry as well (debug, the Menu types, useDataSourceState)
 * - useDataSourceState selects from the closest DataSource and only
 *   re-renders its consumer when the selected value changes
 * - the components.LoadMask override is honoured, same as in React
 */
import { createApp, defineComponent, h, nextTick } from 'vue';
import type { App } from 'vue';

import * as entry from '../../index.vue';
import type {
  DebugLogger,
  MenuIconProps,
  MenuItemDefinition,
  MenuItemObject,
  MenuProps,
} from '../../index.vue';

const { DataSource, InfiniteTable, useDataSourceState, debug } = entry;

type Person = {
  id: number;
  name: string;
  age: number;
};

const people: Person[] = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  name: `person-${i}`,
  age: 20 + (i % 10),
}));

const columns = {
  name: { field: 'name', header: 'Name' },
  age: { field: 'age', header: 'Age' },
};

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

describe('Vue entry', () => {
  let container: HTMLElement;
  let app: App | null = null;

  const mount = async (Root: any) => {
    container = document.createElement('div');
    document.body.appendChild(container);

    app = createApp(Root);
    app.mount(container);
    await flush();
  };

  afterEach(async () => {
    app?.unmount();
    app = null;
    container?.remove();
    await flush(10);
  });

  test('exports the names shared with the React entry', () => {
    expect(typeof entry.debug).toBe('function');
    expect(typeof entry.useDataSourceState).toBe('function');
    expect(typeof entry.useDataSourceContext).toBe('function');

    // type-only exports - this compiles only if they exist on the entry
    const item: MenuItemObject = { key: 'one', label: 'One' };
    const items: MenuItemDefinition[] = [item, '-'];
    const menuProps: MenuProps = { items };
    const iconProps: MenuIconProps = { menuVisible: true };

    expect(menuProps.items).toHaveLength(2);
    expect(iconProps.menuVisible).toBe(true);
  });

  test('debug creates loggers that can be intercepted', () => {
    const logger: DebugLogger = debug('VueEntrySpec');
    const messages: string[] = [];

    const remove = debug.onLogIntent('VueEntrySpec', ({ args }) => {
      messages.push(args.join(' '));
    });

    logger('hello');
    remove();
    logger('ignored');

    expect(messages).toEqual(['hello']);
  });

  test('useDataSourceState selects from the DataSource state and updates only when the selection changes', async () => {
    let renderCount = 0;

    const RowCount = defineComponent({
      setup() {
        const count = useDataSourceState(
          (state) => (state.dataArray as unknown[]).length,
        );

        return () => {
          renderCount++;
          return h('p', { 'data-name': 'count' }, `rows: ${count.value}`);
        };
      },
    });

    await mount(
      defineComponent({
        setup() {
          return () =>
            h(DataSource, { primaryKey: 'id', data: people } as any, {
              default: () => [
                h(RowCount),
                h(InfiniteTable, { columns } as any),
              ],
            });
        },
      }),
    );

    const text = () =>
      container.querySelector('[data-name="count"]')!.textContent;

    expect(text()).toBe('rows: 20');

    const rendersBefore = renderCount;
    const dataSourceApi = (globalThis as any).dataSourceApi;

    // a state change that does not change the selected value
    (globalThis as any).dataSourceActions.sortInfo = [
      { field: 'age', dir: -1 },
    ];
    await flush();

    expect(text()).toBe('rows: 20');
    expect(renderCount).toBe(rendersBefore);

    // a state change that does
    dataSourceApi.removeDataByPrimaryKey(0);
    await flush(60);

    expect(text()).toBe('rows: 19');
    expect(renderCount).toBe(rendersBefore + 1);
  });

  test('components.LoadMask replaces the default load mask', async () => {
    const CustomLoadMask = defineComponent({
      props: { visible: { type: Boolean, required: true } },
      setup(props, { slots }) {
        return () =>
          h(
            'div',
            { title: 'LoadMask', 'data-visible': String(props.visible) },
            slots.default?.(),
          );
      },
    });

    await mount(
      defineComponent({
        setup() {
          return () =>
            h(
              DataSource,
              { primaryKey: 'id', data: people, loading: true } as any,
              {
                default: () =>
                  h(InfiniteTable, {
                    columns,
                    loadingText: 'Fetching',
                    components: { LoadMask: CustomLoadMask },
                  } as any),
              },
            );
        },
      }),
    );

    const mask = container.querySelector('[title="LoadMask"]') as HTMLElement;

    expect(mask).not.toBeNull();
    expect(mask.getAttribute('data-visible')).toBe('true');
    expect(mask.textContent).toBe('Fetching');
    expect(
      container.querySelector(`.${entry.InfiniteTableClassName}-LoadMask`),
    ).toBeNull();
  });
});

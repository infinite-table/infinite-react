/**
 * @jest-environment jsdom
 *
 * Phase 3d validation: inline editing in the Vue table.
 *
 * - api.startEdit / Enter-on-active-cell / double-click all start an edit
 *   through the SAME shared imperative api + onKeyDown/onCellClick handlers
 * - the Vue default editor (InfiniteTableColumnEditorForVue) renders an input
 *   inside the cell, Enter confirms, Escape cancels
 * - confirm flows through the accepted watcher -> api.persistEdit ->
 *   dataSourceApi.updateData, then onEditAccepted/onEditPersistSuccess fire
 * - editable=false columns refuse to edit
 */
import { createApp, defineComponent, h, nextTick } from 'vue';
import type { App } from 'vue';

import { DataSource } from '../DataSource/DataSourceForVue.vue';
import { InfiniteTable } from './InfiniteTableForVue.vue';
import { rootClassName } from './internalProps';

type Person = {
  id: number;
  name: string;
  age: number;
};

const makePeople = () =>
  Array.from({ length: 20 }, (_, i) => ({
    id: i,
    name: `person-${i}`,
    age: 20 + (i % 10),
  }));

const VIEWPORT = { width: 400, height: 300 };

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

describe('Vue InfiniteTable editing', () => {
  let container: HTMLElement;
  let app: App | null = null;
  let people: Person[];

  const mount = async (
    tableProps: Record<string, any> = {},
    dataSourceProps: Record<string, any> = {},
  ) => {
    people = makePeople();
    container = document.createElement('div');
    document.body.appendChild(container);

    const Root = defineComponent({
      setup() {
        return () =>
          h(
            DataSource,
            { primaryKey: 'id', data: people, ...dataSourceProps } as any,
            {
              default: () =>
                h(InfiniteTable, {
                  columns: {
                    name: { field: 'name', header: 'Name' },
                    age: { field: 'age', header: 'Age' },
                  },
                  columnDefaultEditable: true,
                  ...tableProps,
                } as any),
            },
          );
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

    return { getState, actions, api: (globalThis as any).infiniteApi };
  };

  afterEach(async () => {
    app?.unmount();
    app = null;
    container.remove();
    await flush(10);
  });

  const getDataArray = () => (globalThis as any).getDataSourceState().dataArray;

  const cell = (rowId: number | string, columnId = 'name') =>
    container.querySelector(
      `[data-row-id="${rowId}"][data-column-id="${columnId}"]`,
    ) as HTMLElement | null;

  const editorInput = () =>
    container.querySelector('input[type="text"]') as HTMLInputElement | null;

  const setInputValue = (input: HTMLInputElement, value: string) => {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  test('api.startEdit renders the editor; Enter confirms and persists', async () => {
    const onEditAccepted = jest.fn();
    const onEditPersistSuccess = jest.fn();
    const { getState } = await mount({
      onEditAccepted,
      onEditPersistSuccess,
    });

    expect(editorInput()).toBeNull();

    // startEdit through the shared imperative api
    await (globalThis as any).infiniteApi.startEdit({
      rowIndex: 1,
      columnId: 'name',
    });
    await flush();

    expect(getState().editingCell?.active).toBe(true);

    const input = editorInput()!;
    expect(input).not.toBeNull();
    // the editor renders inside the edited cell
    expect(cell(1, 'name')!.contains(input)).toBe(true);
    expect(input.value).toBe('person-1');

    setInputValue(input, 'renamed');
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    // persistEdit awaits a rAF + async persist fn
    await flush(80);

    expect(editorInput()).toBeNull();
    expect(getDataArray()[1].data.name).toBe('renamed');
    expect(cell(1, 'name')!.textContent).toContain('renamed');

    expect(onEditAccepted).toHaveBeenCalledTimes(1);
    expect(onEditAccepted.mock.calls[0][0]).toMatchObject({
      value: 'renamed',
      initialValue: 'person-1',
    });
    expect(onEditPersistSuccess).toHaveBeenCalledTimes(1);
  });

  test('Escape cancels the edit and fires onEditCancelled', async () => {
    const onEditCancelled = jest.fn();
    const { getState } = await mount({ onEditCancelled });

    await (globalThis as any).infiniteApi.startEdit({
      rowIndex: 2,
      columnId: 'name',
    });
    await flush();

    const input = editorInput()!;
    setInputValue(input, 'should-not-persist');
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await flush(80);

    expect(editorInput()).toBeNull();
    expect(getState().editingCell?.active).toBe(false);
    expect(getDataArray()[2].data.name).toBe('person-2');
    expect(onEditCancelled).toHaveBeenCalledTimes(1);
    expect(onEditCancelled.mock.calls[0][0]).toMatchObject({
      initialValue: 'person-2',
    });
  });

  test('Enter on the active cell starts editing (keyboard flow)', async () => {
    await mount({ keyboardNavigation: 'cell', defaultActiveCellIndex: [3, 0] });

    const rootEl = container.querySelector(`.${rootClassName}`) as HTMLElement;
    rootEl.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    await flush(80);

    const input = editorInput()!;
    expect(input).not.toBeNull();
    expect(input.value).toBe('person-3');
    expect(cell(3, 'name')!.contains(input)).toBe(true);
  });

  test('double click starts editing through the shared onCellClick handler', async () => {
    await mount();

    cell(4, 'age')!.dispatchEvent(
      new MouseEvent('click', { bubbles: true, detail: 2 }),
    );
    await flush(80);

    const input = editorInput()!;
    expect(input).not.toBeNull();
    expect(input.value).toBe('24');
    expect(cell(4, 'age')!.contains(input)).toBe(true);
  });

  test('non-editable columns refuse startEdit', async () => {
    await mount({
      columnDefaultEditable: false,
    });

    const editable = await (globalThis as any).infiniteApi.startEdit({
      rowIndex: 1,
      columnId: 'name',
    });
    await flush();

    expect(editable).toBe(false);
    expect(editorInput()).toBeNull();
  });

  test('shouldAcceptEdit=false rejects the edit and fires onEditRejected', async () => {
    const onEditRejected = jest.fn();
    await mount({
      shouldAcceptEdit: () => false,
      onEditRejected,
    });

    await (globalThis as any).infiniteApi.startEdit({
      rowIndex: 5,
      columnId: 'name',
    });
    await flush();

    const input = editorInput()!;
    setInputValue(input, 'rejected-value');
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    await flush(80);

    expect(getDataArray()[5].data.name).toBe('person-5');
    expect(onEditRejected).toHaveBeenCalledTimes(1);
  });
});

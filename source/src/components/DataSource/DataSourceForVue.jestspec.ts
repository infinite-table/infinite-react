/**
 * @jest-environment jsdom
 *
 * Phase 3 validation for the Vue DataSource: the shared state machine
 * (getInitialState / deriveStateFromProps / concludeReducer) + data loading
 * driven through the Vue adapter — local array data, local sorting,
 * controlled sortInfo, remote (function) data, loading flag and dataParams.
 */
import { createApp, defineComponent, h, nextTick, ref } from 'vue';
import type { App, Ref } from 'vue';

import { DataSource, useDataSourceContext } from './DataSourceForVue.vue';
import type { DataSourceContextValueForVue } from './DataSourceForVue.vue';
import { defaultFilterFunction } from './defaultFilterFunction';
import { multisort } from '../../utils/multisort';

type Person = {
  id: number;
  name: string;
  age: number;
};

const people: Person[] = [
  { id: 1, name: 'bob', age: 30 },
  { id: 2, name: 'alice', age: 20 },
  { id: 3, name: 'carol', age: 40 },
];

async function flush(times = 4) {
  for (let i = 0; i < times; i++) {
    await nextTick();
    await Promise.resolve();
  }
  await new Promise((resolve) => setTimeout(resolve, 10));
  await nextTick();
}

function mountDataSource(initialProps: Record<string, any>) {
  const propsRef: Ref<Record<string, any>> = ref(initialProps);

  let context: DataSourceContextValueForVue<Person> | null = null;

  const Child = defineComponent({
    setup() {
      context = useDataSourceContext<Person>();
      return () => {
        const state = context!.state.value;
        return h(
          'div',
          { 'data-rows': state.dataArray.length },
          state.dataArray.map((rowInfo) =>
            h(
              'div',
              { 'data-row': rowInfo.id },
              (rowInfo.data as Person | null)?.name ?? '',
            ),
          ),
        );
      };
    },
  });

  const Root = defineComponent({
    setup() {
      return () =>
        h(DataSource, { ...propsRef.value }, { default: () => h(Child) });
    },
  });

  const container = document.createElement('div');
  document.body.appendChild(container);
  const app: App = createApp(Root);
  app.config.warnHandler = () => {};
  app.mount(container);

  return {
    container,
    async setProps(props: Record<string, any>) {
      propsRef.value = props;
      await flush();
    },
    getContext: () => context!,
    getState: () => context!.state.value,
    renderedNames: () =>
      Array.from(container.querySelectorAll('[data-row]')).map(
        (el) => el.textContent,
      ),
    unmount() {
      app.unmount();
      container.remove();
    },
  };
}

describe('Vue DataSource', () => {
  test('loads local array data into the rowInfo dataArray and renders through the slot', async () => {
    const harness = mountDataSource({ primaryKey: 'id', data: people });
    await flush();

    const state = harness.getState();
    expect(state.originalDataArray).toEqual(people);
    expect(state.dataArray.length).toBe(3);
    expect(state.dataArray[0].data).toEqual(people[0]);

    // slot re-rendered with the loaded rows
    expect(harness.renderedNames()).toEqual(['bob', 'alice', 'carol']);

    harness.unmount();
  });

  test('defaultSortInfo sorts locally through the shared reducer pipeline', async () => {
    const harness = mountDataSource({
      primaryKey: 'id',
      data: people,
      defaultSortInfo: { field: 'age', dir: 1 },
    });
    await flush();

    expect(harness.renderedNames()).toEqual(['alice', 'bob', 'carol']);
    harness.unmount();
  });

  test('setting sortInfo through generated actions re-sorts and fires onSortInfoChange', async () => {
    const onSortInfoChange = jest.fn();
    const harness = mountDataSource({
      primaryKey: 'id',
      data: people,
      defaultSortInfo: [],
      onSortInfoChange,
    });
    await flush();

    harness.getContext().dataSourceActions.sortInfo = [
      { field: 'age', dir: -1 },
    ] as any;
    await flush();

    expect(harness.renderedNames()).toEqual(['carol', 'bob', 'alice']);
    expect(onSortInfoChange).toHaveBeenCalled();
    harness.unmount();
  });

  test('controlled sortInfo (sorted locally by default): state follows the prop', async () => {
    const harness = mountDataSource({
      primaryKey: 'id',
      data: people,
      sortInfo: [{ field: 'age', dir: 1 }],
    });
    await flush();
    expect(harness.renderedNames()).toEqual(['alice', 'bob', 'carol']);

    await harness.setProps({
      primaryKey: 'id',
      data: people,
      sortInfo: [{ field: 'age', dir: -1 }],
    });

    expect(harness.renderedNames()).toEqual(['carol', 'bob', 'alice']);
    harness.unmount();
  });

  test('function data: loading -> loaded, with dataParams built for the call', async () => {
    let resolveData: (value: { data: Person[] }) => void;
    const dataFn = jest.fn(
      () =>
        new Promise<{ data: Person[] }>((resolve) => {
          resolveData = resolve;
        }),
    );

    const harness = mountDataSource({ primaryKey: 'id', data: dataFn });
    await flush();

    expect(dataFn).toHaveBeenCalledTimes(1);
    expect(harness.getState().loading).toBe(true);
    expect(harness.getState().dataArray.length).toBe(0);

    resolveData!({ data: people });
    await flush();

    expect(harness.getState().loading).toBe(false);
    expect(harness.renderedNames()).toEqual(['bob', 'alice', 'carol']);
    harness.unmount();
  });

  test('changing the data prop reloads', async () => {
    const harness = mountDataSource({ primaryKey: 'id', data: people });
    await flush();
    expect(harness.renderedNames()).toEqual(['bob', 'alice', 'carol']);

    const newPeople: Person[] = [{ id: 9, name: 'zoe', age: 50 }];
    await harness.setProps({ primaryKey: 'id', data: newPeople });

    expect(harness.renderedNames()).toEqual(['zoe']);
    harness.unmount();
  });

  test('remote reload on sortInfo change when shouldReloadData.sortInfo is true', async () => {
    const dataFn = jest.fn((params: any) => {
      let result = [...people];
      const sortInfo = Array.isArray(params.sortInfo)
        ? params.sortInfo[0]
        : params.sortInfo;
      if (sortInfo) {
        const { field, dir } = sortInfo;
        result.sort(
          (a: any, b: any) => (a[field] < b[field] ? -1 : 1) * (dir ?? 1),
        );
      }
      return Promise.resolve({ data: result });
    });

    const harness = mountDataSource({
      primaryKey: 'id',
      data: dataFn,
      shouldReloadData: { sortInfo: true },
      defaultSortInfo: [],
    });
    await flush();

    expect(dataFn).toHaveBeenCalledTimes(1);
    expect(harness.renderedNames()).toEqual(['bob', 'alice', 'carol']);

    harness.getContext().dataSourceActions.sortInfo = [
      { field: 'name', dir: 1 },
    ] as any;
    await flush();

    // the sortInfo change triggered a remote reload (no local sort)
    expect(dataFn).toHaveBeenCalledTimes(2);
    expect(harness.renderedNames()).toEqual(['alice', 'bob', 'carol']);
    harness.unmount();
  });

  test('a new filterTypes object with the same content does not refetch', async () => {
    const dataFn = jest.fn(() => Promise.resolve({ data: [...people] }));
    const makeFilterTypes = () => ({
      custom: {
        emptyValues: [''],
        defaultOperator: 'eq',
        operators: [{ name: 'eq', fn: () => true }],
      },
    });

    const harness = mountDataSource({
      primaryKey: 'id',
      data: dataFn,
      filterTypes: makeFilterTypes(),
    });
    await flush();
    expect(dataFn).toHaveBeenCalledTimes(1);

    await harness.setProps({
      primaryKey: 'id',
      data: dataFn,
      filterTypes: makeFilterTypes(),
    });
    await flush();

    expect(dataFn).toHaveBeenCalledTimes(1);
    harness.unmount();
  });

  test('onDataParamsChange fires initially and the api is exposed via onReady', async () => {
    const onDataParamsChange = jest.fn();
    const onReady = jest.fn();
    const harness = mountDataSource({
      primaryKey: 'id',
      data: people,
      onDataParamsChange,
      onReady,
    });
    await flush();

    expect(harness.getState().dataParams).toBeDefined();
    expect(onDataParamsChange).toHaveBeenCalled();
    expect(onReady).toHaveBeenCalledTimes(1);
    expect(onReady.mock.calls[0][0]).toBe(harness.getContext().dataSourceApi);
    harness.unmount();
  });

  test('a data function without shouldReloadData is called once; sorting and filtering are local', async () => {
    const dataFn = jest.fn(() => Promise.resolve({ data: [...people] }));
    const harness = mountDataSource({
      primaryKey: 'id',
      data: dataFn,
      defaultSortInfo: [],
      defaultFilterValue: [],
    });
    await flush();
    expect(dataFn).toHaveBeenCalledTimes(1);

    harness.getContext().dataSourceActions.sortInfo = [
      { field: 'age', dir: 1 },
    ] as any;
    await flush();
    expect(harness.renderedNames()).toEqual(['alice', 'bob', 'carol']);

    harness.getContext().dataSourceActions.filterValue = [
      {
        field: 'name',
        filter: { type: 'string', operator: 'includes', value: 'o' },
      },
    ] as any;
    await flush();
    expect(harness.renderedNames()).toEqual(['bob', 'carol']);

    expect(dataFn).toHaveBeenCalledTimes(1);
    harness.unmount();
  });

  test('shouldReloadData.sortInfo + sortFunction: refetches and sorts locally', async () => {
    // the server returns the rows in the same order, whatever the sort
    const dataFn = jest.fn(() => Promise.resolve({ data: [...people] }));
    const harness = mountDataSource({
      primaryKey: 'id',
      data: dataFn,
      defaultSortInfo: [],
      sortFunction: multisort,
      shouldReloadData: { sortInfo: true },
    });
    await flush();
    expect(dataFn).toHaveBeenCalledTimes(1);

    harness.getContext().dataSourceActions.sortInfo = [
      { field: 'age', dir: -1 },
    ] as any;
    await flush();

    expect(dataFn).toHaveBeenCalledTimes(2);
    expect(harness.renderedNames()).toEqual(['carol', 'bob', 'alice']);
    harness.unmount();
  });

  test('shouldReloadData.filterValue + defaultFilterFunction: refetches and filters locally', async () => {
    // the server ignores the filter
    const dataFn = jest.fn(() => Promise.resolve({ data: [...people] }));
    const harness = mountDataSource({
      primaryKey: 'id',
      data: dataFn,
      defaultFilterValue: [],
      filterFunction: defaultFilterFunction,
      shouldReloadData: { filterValue: true },
    });
    await flush();
    expect(dataFn).toHaveBeenCalledTimes(1);

    harness.getContext().dataSourceActions.filterValue = [
      {
        field: 'name',
        filter: { type: 'string', operator: 'includes', value: 'ali' },
      },
    ] as any;
    await flush();

    expect(dataFn).toHaveBeenCalledTimes(2);
    expect(harness.renderedNames()).toEqual(['alice']);
    harness.unmount();
  });

  test('local filtering: dataParams.filterValue keeps every item but drops the value getters', async () => {
    const harness = mountDataSource({
      primaryKey: 'id',
      data: people,
      defaultFilterValue: [],
    });
    await flush();

    harness.getContext().dataSourceActions.filterValue = [
      {
        field: 'name',
        valueGetter: ({ data }: any) => data.name,
        filter: { type: 'string', operator: 'includes', value: 'o' },
      },
      {
        field: 'name',
        filter: { type: 'string', operator: 'includes', value: '' },
      },
    ] as any;
    await flush();

    const filterValue = harness.getState().dataParams!.filterValue!;
    expect(filterValue.length).toBe(2);
    expect(filterValue[0]).not.toHaveProperty('valueGetter');
    expect(filterValue[0].filter.value).toBe('o');
    expect(harness.renderedNames()).toEqual(['bob', 'carol']);
    harness.unmount();
  });

  test('a rejected data call clears loading and keeps the previous rows', async () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    let fail = false;
    const dataFn = jest.fn(() =>
      fail
        ? Promise.reject(new Error('server down'))
        : Promise.resolve({ data: [...people] }),
    );
    const harness = mountDataSource({
      primaryKey: 'id',
      data: dataFn,
      defaultSortInfo: [],
      shouldReloadData: { sortInfo: true },
    });
    await flush();
    expect(harness.renderedNames()).toEqual(['bob', 'alice', 'carol']);

    fail = true;
    harness.getContext().dataSourceActions.sortInfo = [
      { field: 'age', dir: 1 },
    ] as any;
    await flush();

    expect(dataFn).toHaveBeenCalledTimes(2);
    expect(harness.getState().loading).toBe(false);
    expect(harness.renderedNames()).toEqual(['bob', 'alice', 'carol']);
    expect(consoleError).toHaveBeenCalled();

    fail = false;
    harness.getContext().dataSourceActions.sortInfo = [
      { field: 'age', dir: -1 },
    ] as any;
    await flush();

    expect(dataFn).toHaveBeenCalledTimes(3);
    expect(harness.getState().loading).toBe(false);

    consoleError.mockRestore();
    harness.unmount();
  });

  test('a data function that throws clears loading', async () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const dataFn = jest.fn(() => {
      throw new Error('boom');
    });
    const harness = mountDataSource({ primaryKey: 'id', data: dataFn });
    await flush();

    expect(dataFn).toHaveBeenCalledTimes(1);
    expect(harness.getState().loading).toBe(false);
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
    harness.unmount();
  });

  test('dataSourceApi mutations flow through the shared reducer (updateData)', async () => {
    const harness = mountDataSource({ primaryKey: 'id', data: people });
    await flush();

    await harness.getContext().dataSourceApi.updateData({
      id: 2,
      name: 'ALICE',
    } as any);
    await flush();

    expect(harness.renderedNames()).toEqual(['bob', 'ALICE', 'carol']);
    harness.unmount();
  });
});

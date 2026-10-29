/**
 * Lazy load selection counts: the work is bounded by the loaded rows and the selection entries,
 * not by their product. The counts are checked in examples/.../RowSelectionStateTarget.spec.ts.
 */
import { DeepMap } from '../../utils/DeepMap';
import {
  RowSelectionState,
  RowSelectionStateConfig,
  RowSelectionStateObject,
} from './RowSelectionState';

type Row = { id: number; country: string; city: string };

/**
 * Counts the reads of the array items
 */
function countReads<T>(items: T[]) {
  const counter = { reads: 0 };
  const proxy = new Proxy(items, {
    get(target, prop, receiver) {
      if (typeof prop === 'string' && /^\d+$/.test(prop)) {
        counter.reads++;
      }
      return Reflect.get(target, prop, receiver);
    },
  });
  return { items: proxy, counter };
}

const rows = (count: number, country = '', city = ''): Row[] =>
  Array.from({ length: count }, (_, i) => ({ id: i, country, city }));

const config = (
  partial: Partial<RowSelectionStateConfig<Row>>,
): RowSelectionStateConfig<Row> => ({
  groupBy: [],
  groupDeepMap: undefined,
  toPrimaryKey: (row: Row) => row.id,
  totalCount: 0,
  indexer: { getDataForPrimaryKey: () => undefined } as any,
  lazyLoad: true,
  onlyUsePrimaryKeys: false,
  multiRowSelectionTarget: 'visible',
  someRowsFilteredOut: false,
  ...partial,
});

describe('RowSelectionState - lazy load counting work', () => {
  test('flat: each loaded row is read once, however many rows are selected', () => {
    const loadedCount = 2000;
    const selectedCount = 500;
    const { items, counter } = countReads(rows(loadedCount));

    const state = new RowSelectionState<Row>(
      {
        defaultSelection: false,
        selectedRows: Array.from({ length: selectedCount }, (_, i) => i * 2),
      },
      () =>
        config({
          originalDataArray: items,
          totalCount: loadedCount,
          onlyUsePrimaryKeys: true,
        }),
    );

    expect(state.getSelectionCountFor([])).toEqual({
      selectedCount,
      deselectedCount: loadedCount - selectedCount,
    });
    expect(counter.reads).toBeLessThanOrEqual(loadedCount);
  });

  test('grouped: the rows of a group are read once, however many of its selected rows the filter hides', () => {
    const groupCount = 10;
    const loadedPerGroup = 200;
    const hiddenPerGroup = 100;
    const groupDeepMap = new DeepMap<any, any>();
    const counters: { reads: number }[] = [];
    const selection: RowSelectionStateObject = {
      defaultSelection: false,
      selectedRows: [],
    };

    for (let g = 0; g < groupCount; g++) {
      const country = `country-${g}`;
      const { items, counter } = countReads(
        rows(loadedPerGroup, country).map((row) => ({
          ...row,
          id: g * 10000 + row.id,
        })),
      );
      counters.push(counter);
      groupDeepMap.set([country], {
        items,
        childrenAvailable: true,
        totalChildrenCount: loadedPerGroup,
      });
      for (let i = 0; i < hiddenPerGroup; i++) {
        // ids the server did not send: rows the filter hides
        selection.selectedRows!.push([country, g * 10000 + loadedPerGroup + i]);
      }
    }

    const state = new RowSelectionState<Row>(selection, () =>
      config({
        groupBy: [{ field: 'country' }],
        groupDeepMap,
        totalCount: groupCount * loadedPerGroup,
        lazyGroupedRowCount: groupCount * loadedPerGroup,
      }),
    );

    expect(state.getSelectionCountFor([])).toEqual({
      selectedCount: 0,
      deselectedCount: groupCount * loadedPerGroup,
    });
    counters.forEach((counter) => {
      expect(counter.reads).toBeLessThanOrEqual(loadedPerGroup);
    });
  });

  test('grouped: the children of a group are listed once, however many of its selected subgroups the filter hides', () => {
    const countryCount = 5;
    const citiesPerCountry = 4;
    const hiddenCitiesPerCountry = 50;
    const groupDeepMap = new DeepMap<any, any>();
    const selection: RowSelectionStateObject = {
      defaultSelection: true,
      deselectedRows: [],
    };

    for (let c = 0; c < countryCount; c++) {
      const country = `country-${c}`;
      groupDeepMap.set([country], {
        items: [],
        childrenAvailable: true,
        totalChildrenCount: citiesPerCountry,
      });
      for (let i = 0; i < citiesPerCountry; i++) {
        groupDeepMap.set([country, `city-${i}`], {
          items: [{ id: c * 100 + i, country, city: `city-${i}` }],
          childrenAvailable: true,
          totalChildrenCount: 1,
        });
      }
      for (let i = 0; i < hiddenCitiesPerCountry; i++) {
        selection.deselectedRows!.push([country, `hidden-city-${i}`]);
      }
    }
    const getKeysStartingWith = jest.spyOn(groupDeepMap, 'getKeysStartingWith');

    const state = new RowSelectionState<Row>(selection, () =>
      config({
        groupBy: [{ field: 'country' }, { field: 'city' }],
        groupDeepMap,
        totalCount: countryCount * citiesPerCountry,
        lazyGroupedRowCount: countryCount * citiesPerCountry,
      }),
    );

    expect(state.getSelectionCountFor([])).toEqual({
      selectedCount: countryCount * citiesPerCountry,
      deselectedCount: 0,
    });
    // once for the root and once per country
    expect(getKeysStartingWith.mock.calls.length).toBeLessThanOrEqual(
      countryCount + 1,
    );
  });

  test('grouped, without counts from the server: the groups are listed once per level', () => {
    const countryCount = 20;
    const citiesPerCountry = 5;
    const groupDeepMap = new DeepMap<any, any>();
    const selection: RowSelectionStateObject = {
      defaultSelection: false,
      selectedRows: [],
    };

    for (let c = 0; c < countryCount; c++) {
      const country = `country-${c}`;
      groupDeepMap.set([country], { items: [], childrenAvailable: true });
      for (let i = 0; i < citiesPerCountry; i++) {
        const city = `city-${i}`;
        groupDeepMap.set([country, city], {
          items: rows(3, country, city),
          childrenAvailable: true,
        });
      }
      selection.selectedRows!.push([country, 'city-0']);
    }
    const getKeysStartingWith = jest.spyOn(groupDeepMap, 'getKeysStartingWith');

    const state = new RowSelectionState<Row>(selection, () =>
      config({
        groupBy: [{ field: 'country' }, { field: 'city' }],
        groupDeepMap,
        totalCount: countryCount * citiesPerCountry * 3,
        multiRowSelectionTarget: 'all',
      }),
    );

    expect(state.getSelectionCountFor([])).toEqual({
      selectedCount: countryCount * 3,
      deselectedCount: countryCount * (citiesPerCountry - 1) * 3,
    });
    // the group rows ask for their own counts
    for (let c = 0; c < countryCount; c++) {
      expect(state.getSelectionCountFor([`country-${c}`])).toEqual({
        selectedCount: 3,
        deselectedCount: (citiesPerCountry - 1) * 3,
      });
    }
    // the root lists the countries, and each country lists its cities, once
    expect(getKeysStartingWith.mock.calls.length).toBeLessThanOrEqual(
      countryCount + 1,
    );
  });

  test('the selection entries are only collected again when the selection changes', () => {
    const loadedCount = 100;
    const data = rows(loadedCount);
    let getConfig = () =>
      config({
        originalDataArray: data,
        totalCount: loadedCount,
        onlyUsePrimaryKeys: true,
      });

    const state = new RowSelectionState<Row>(
      { defaultSelection: false, selectedRows: [1, 2, 3] },
      () => getConfig(),
    );
    const selectedMap: DeepMap<any, boolean> = (state as any).selectedMap;
    const getKeysStartingWith = jest.spyOn(selectedMap, 'getKeysStartingWith');

    expect(state.getSelectionCountFor([]).selectedCount).toBe(3);
    expect(getKeysStartingWith).toHaveBeenCalledTimes(1);

    // the reducer refreshes the config and clears the caches on every pass
    getConfig = () =>
      config({
        originalDataArray: [
          ...data,
          ...rows(10).map((r) => ({ ...r, id: 1000 + r.id })),
        ],
        totalCount: loadedCount + 10,
        onlyUsePrimaryKeys: true,
      });
    (state as any).xcache();

    expect(state.getSelectionCountFor([])).toEqual({
      selectedCount: 3,
      deselectedCount: loadedCount + 10 - 3,
    });
    expect(getKeysStartingWith).toHaveBeenCalledTimes(1);

    state.setRowAsSelected(4);
    expect(state.getSelectionCountFor([]).selectedCount).toBe(4);
    expect(getKeysStartingWith).toHaveBeenCalledTimes(2);

    state.setRowAsDeselected(4);
    state.setRowAsDeselected(3);
    expect(state.getSelectionCountFor([]).selectedCount).toBe(2);
  });
});

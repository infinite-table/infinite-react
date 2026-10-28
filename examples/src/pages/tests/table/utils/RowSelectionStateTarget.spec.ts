import { test, expect } from '@playwright/test';
import {
  RowSelectionState,
  RowSelectionStateObject,
} from '@src/components/DataSource/RowSelectionState';
import { group } from '@src/utils/groupAndPivot';

type Developer = {
  id: number;
  country: string;
  city: string;
  language: string;
};

const data: Developer[] = [
  { id: 1, country: 'France', city: 'Paris', language: 'TS' },
  { id: 2, country: 'France', city: 'Paris', language: 'JS' },
  { id: 3, country: 'France', city: 'Lyon', language: 'TS' },
  { id: 4, country: 'Italy', city: 'Rome', language: 'JS' },
  { id: 5, country: 'Italy', city: 'Rome', language: 'TS' },
];

const byId = Object.fromEntries(data.map((d) => [d.id, d]));

function build(
  selection: RowSelectionStateObject,
  options: {
    target: 'all' | 'visible';
    groupBy?: (keyof Developer)[];
    useGroupKeys?: boolean;
    filtered?: boolean;
  },
) {
  const filtered = options.filtered ?? true;
  const visible = filtered ? data.filter((d) => d.language === 'TS') : data;
  const groupBy = (options.groupBy ?? []).map((field) => ({ field }));
  const groupDeepMap = groupBy.length
    ? group({ groupBy }, visible).deepMap
    : undefined;

  return new RowSelectionState<Developer>(selection, () => ({
    groupBy,
    groupDeepMap,
    toPrimaryKey: (d: Developer) => d.id,
    totalCount: data.length,
    indexer: { getDataForPrimaryKey: (pk: number) => byId[pk] } as any,
    lazyLoad: false,
    onlyUsePrimaryKeys: !options.useGroupKeys,
    multiRowSelectionTarget: options.target,
    someRowsFilteredOut: visible.length < data.length,
    originalDataArray: data,
    postFilterDataArray: visible,
  }));
}

const selectedIds = (state: RowSelectionState<Developer>) =>
  data.filter((d) => state.isRowSelected(d.id)).map((d) => d.id);

const NONE: RowSelectionStateObject = {
  defaultSelection: false,
  selectedRows: [],
};

export default test.describe.parallel('RowSelectionState - target', () => {
  test('flat - all: selectAll and counts include filtered out rows', () => {
    const state = build(
      { defaultSelection: false, selectedRows: [1, 3, 5] },
      { target: 'all' },
    );
    expect(state.getSelectionCountFor([])).toEqual({
      selectedCount: 3,
      deselectedCount: 2,
    });

    state.selectAll();
    expect(selectedIds(state)).toEqual([1, 2, 3, 4, 5]);

    state.deselectAll();
    expect(selectedIds(state)).toEqual([]);
  });

  test('flat - visible: selectAll and counts only include visible rows', () => {
    const state = build(
      { defaultSelection: false, selectedRows: [1, 3, 5] },
      { target: 'visible' },
    );
    expect(state.getSelectionCountFor([])).toEqual({
      selectedCount: 3,
      deselectedCount: 0,
    });

    const other = build(
      { defaultSelection: false, selectedRows: [2] },
      { target: 'visible' },
    );
    other.selectAll();
    expect(selectedIds(other)).toEqual([1, 2, 3, 5]);
    expect(other.getState().defaultSelection).toBe(false);

    other.deselectAll();
    expect(selectedIds(other)).toEqual([2]);
  });

  test('flat - visible without filtered out rows behaves like all', () => {
    const state = build(NONE, { target: 'visible', filtered: false });
    state.selectAll();
    expect(state.getState().defaultSelection).toBe(true);
    expect(selectedIds(state)).toEqual([1, 2, 3, 4, 5]);
  });

  for (const useGroupKeys of [false, true]) {
    const mode = useGroupKeys ? 'group keys' : 'primary keys';
    const groupBy: (keyof Developer)[] = ['country', 'city'];

    test(`grouped (${mode}) - all: group selection includes filtered out rows`, () => {
      const state = build(NONE, { target: 'all', groupBy, useGroupKeys });

      state.selectGroupRow(['France']);
      expect(selectedIds(state)).toEqual([1, 2, 3]);
      expect(state.getSelectionCountFor(['France'])).toEqual({
        selectedCount: 3,
        deselectedCount: 0,
      });

      const partial = build(
        {
          defaultSelection: false,
          selectedRows: useGroupKeys
            ? [
                ['France', 'Paris', 1],
                ['France', 'Lyon', 3],
              ]
            : [1, 3],
        },
        { target: 'all', groupBy, useGroupKeys },
      );
      expect(partial.getGroupRowSelectionState(['France'])).toBe(null);
      expect(partial.getSelectionCountFor(['France'])).toEqual({
        selectedCount: 2,
        deselectedCount: 1,
      });
      expect(partial.getSelectionCountFor([])).toEqual({
        selectedCount: 2,
        deselectedCount: 3,
      });

      partial.selectAll();
      expect(selectedIds(partial)).toEqual([1, 2, 3, 4, 5]);
    });

    test(`grouped (${mode}) - visible: group selection only includes visible rows`, () => {
      const state = build(
        {
          defaultSelection: false,
          selectedRows: useGroupKeys ? [['Italy', 'Rome', 4]] : [4],
        },
        { target: 'visible', groupBy, useGroupKeys },
      );

      state.selectGroupRow(['France']);
      expect(selectedIds(state)).toEqual([1, 3, 4]);
      expect(state.getGroupRowSelectionState(['France'])).toBe(true);
      expect(state.getSelectionCountFor(['France'])).toEqual({
        selectedCount: 2,
        deselectedCount: 0,
      });

      state.selectAll();
      expect(selectedIds(state)).toEqual([1, 3, 4, 5]);
      expect(state.getSelectionCountFor([])).toEqual({
        selectedCount: 3,
        deselectedCount: 0,
      });

      state.deselectGroupRow(['Italy']);
      expect(selectedIds(state)).toEqual([1, 3, 4]);

      state.deselectAll();
      expect(selectedIds(state)).toEqual([4]);
    });
  }

  test('grouped (group keys) - visible: never stores a group key that covers filtered out rows', () => {
    const groupBy: (keyof Developer)[] = ['country', 'city'];
    const state = build(NONE, {
      target: 'visible',
      groupBy,
      useGroupKeys: true,
    });

    state.selectGroupRow(['France']);
    state.setRowAsSelected(5, ['Italy', 'Rome']);

    const { selectedRows, defaultSelection } = state.getState() as {
      selectedRows: any[];
      defaultSelection: boolean;
    };
    expect(defaultSelection).toBe(false);
    expect(selectedRows).toEqual(
      expect.arrayContaining([
        ['France', 'Paris', 1],
        ['France', 'Lyon', 3],
        ['Italy', 'Rome', 5],
      ]),
    );
    expect(selectedRows).not.toContainEqual(['France']);
    expect(selectedRows).not.toContainEqual(['France', 'Paris']);
    expect(selectedRows).not.toContainEqual(['Italy']);
    expect(selectedRows).not.toContainEqual(['Italy', 'Rome']);
    expect(selectedIds(state)).toEqual([1, 3, 5]);
  });
});

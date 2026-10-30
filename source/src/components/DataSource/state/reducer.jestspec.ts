/**
 * Pinning tests for the DataSource state pipeline:
 * initSetupState + forwardProps + deriveStateFromProps (mapPropsToState) +
 * concludeReducer (sort -> group/tree -> filter -> flatten).
 *
 * These tests drive the REAL DataSource state machinery through the
 * framework-neutral managed-state functions (managedComponentState.ts),
 * with no React involved — pinning the pipeline behavior independently of
 * any framework adapter. They also document the reference-equality
 * memoization contract that every framework adapter must respect
 * (state objects must never be wrapped in reactivity proxies).
 */
import {
  initManagedState,
  managedComponentReducer,
} from '../../hooks/useComponentState/managedComponentState';

import {
  initSetupState,
  forwardProps,
  deriveStateFromProps,
} from './getInitialState';
import { concludeReducer } from './reducer';
import {
  defaultFilterFunction,
  defaultTreeFilterFunction,
} from '../defaultFilterFunction';
import { multisort } from '../../../utils/multisort';

import type { DataSourceProps } from '../types';

type Developer = {
  id: number;
  name: string;
  age: number;
  country: string;
};

const developers: Developer[] = [
  { id: 1, name: 'Bob', age: 30, country: 'USA' },
  { id: 2, name: 'Alice', age: 25, country: 'France' },
  { id: 3, name: 'Carl', age: 40, country: 'USA' },
  { id: 4, name: 'Dana', age: 35, country: 'France' },
];

type TreeNode = {
  id: string;
  name: string;
  children?: TreeNode[];
};

const treeData: TreeNode[] = [
  {
    id: 'root1',
    name: 'Documents',
    children: [
      { id: 'leaf1', name: 'report.doc' },
      { id: 'leaf2', name: 'photo.jpg' },
    ],
  },
  { id: 'root2', name: 'empty.txt' },
];

/**
 * Builds DataSource state exactly like the managed component does, then
 * lets tests dispatch actions through the same reducer path the React
 * adapter (useReducer) uses.
 */
function createDataSourceHarness<T>(initialProps: DataSourceProps<T>) {
  let props: any = initialProps;

  const propsToStateSet = new Set<string>();
  const setupState = initSetupState(props);
  const propsToForward = forwardProps(setupState as any, props);

  let state: any = initManagedState({
    props,
    initialSetupState: setupState,
    propsToForward: propsToForward as any,
    parentState: null,
    mapPropsToState: deriveStateFromProps as any,
    propsToStateSet,
  });

  const dispatch = (action: any) => {
    state = managedComponentReducer(state, action, {
      getProps: () => props,
      getParentState: () => null,
      mapPropsToState: deriveStateFromProps as any,
      concludeReducer: concludeReducer as any,
      propsToStateSet,
    });
    return state;
  };

  return {
    getState: () => state,
    setProps(newProps: Partial<DataSourceProps<T>>) {
      props = { ...props, ...newProps };
    },
    dispatch,
    // mirrors what generated action setters dispatch (actions.xyz = value)
    setStateValue(key: string, value: any) {
      return dispatch({
        payload: {
          updatedProps: null,
          mappedState: { [key]: value },
        },
      });
    },
    setData(dataArray: T[]) {
      return this.setStateValue('originalDataArray', dataArray);
    },
  };
}

describe('DataSource reducer pipeline - flat data', () => {
  test('setting originalDataArray produces rowInfo dataArray with ids, order and counts', () => {
    const harness = createDataSourceHarness<Developer>({
      primaryKey: 'id',
      data: developers,
    });

    harness.setData(developers);
    const state = harness.getState();

    expect(state.dataArray.length).toBe(4);
    expect(state.dataArray.map((ri: any) => ri.id)).toEqual([1, 2, 3, 4]);
    expect(state.dataArray.map((ri: any) => ri.data)).toEqual(developers);
    expect(state.dataArray[0]).toMatchObject({
      isGroupRow: false,
      indexInAll: 0,
      selfLoaded: true,
    });
    expect(state.unfilteredCount).toBe(4);
    expect(state.filteredCount).toBe(4);
  });

  test('uncontrolled defaultSortInfo -> sortMode local -> dataArray is sorted locally', () => {
    const harness = createDataSourceHarness<Developer>({
      primaryKey: 'id',
      data: developers,
      defaultSortInfo: { field: 'age', dir: 1 },
    });

    expect(harness.getState().sortMode).toBe('local');

    harness.setData(developers);
    const state = harness.getState();

    expect(state.dataArray.map((ri: any) => ri.data.age)).toEqual([
      25, 30, 35, 40,
    ]);
    // the original data array is NOT mutated by sorting
    expect(developers.map((d) => d.age)).toEqual([30, 25, 40, 35]);
  });

  test('controlled sortInfo -> sortMode local -> dataArray is sorted locally', () => {
    const harness = createDataSourceHarness<Developer>({
      primaryKey: 'id',
      data: developers,
      sortInfo: { field: 'age', dir: 1 },
    });

    expect(harness.getState().sortMode).toBe('local');
    expect(harness.getState().controlledSort).toBe(true);
    expect(harness.getState().shouldReloadData.sortInfo).toBe(false);

    harness.setData(developers);
    const state = harness.getState();

    expect(state.dataArray.map((ri: any) => ri.data.age)).toEqual([
      25, 30, 35, 40,
    ]);
  });

  test('controlled sortInfo + shouldReloadData.sortInfo -> sortMode remote -> NO local sorting', () => {
    const harness = createDataSourceHarness<Developer>({
      primaryKey: 'id',
      data: developers,
      sortInfo: { field: 'age', dir: 1 },
      shouldReloadData: { sortInfo: true },
    });

    expect(harness.getState().sortMode).toBe('remote');

    harness.setData(developers);

    // data stays in the original order - the server is expected to sort
    expect(harness.getState().dataArray.map((ri: any) => ri.data.age)).toEqual([
      30, 25, 40, 35,
    ]);
  });

  test('controlled filterValue + shouldReloadData.filterValue -> the owner filters, rows are kept as passed', () => {
    const harness = createDataSourceHarness<Developer>({
      primaryKey: 'id',
      data: developers,
      filterValue: [
        {
          field: 'country',
          filter: { type: 'string', operator: 'includes', value: 'usa' },
        },
      ],
      shouldReloadData: { filterValue: true },
    });

    expect(harness.getState().filterMode).toBe('remote');

    harness.setData(developers);
    const state = harness.getState();

    expect(state.dataArray.map((ri: any) => ri.data.name)).toEqual([
      'Bob',
      'Alice',
      'Carl',
      'Dana',
    ]);
  });

  test('sortInfo change re-sorts; descending', () => {
    const harness = createDataSourceHarness<Developer>({
      primaryKey: 'id',
      data: developers,
      defaultSortInfo: { field: 'age', dir: 1 },
    });
    harness.setData(developers);

    harness.setStateValue('sortInfo', [{ field: 'age', dir: -1 }]);

    expect(harness.getState().dataArray.map((ri: any) => ri.data.age)).toEqual([
      40, 35, 30, 25,
    ]);
  });

  test('local filtering via filterValue with default string filter type', () => {
    const harness = createDataSourceHarness<Developer>({
      primaryKey: 'id',
      data: developers,
      defaultFilterValue: [],
    });
    expect(harness.getState().filterMode).toBe('local');

    harness.setData(developers);
    harness.setStateValue('filterValue', [
      {
        field: 'country',
        filter: { type: 'string', operator: 'includes', value: 'usa' },
      },
    ]);

    const state = harness.getState();
    expect(state.dataArray.map((ri: any) => ri.data.name)).toEqual([
      'Bob',
      'Carl',
    ]);
    expect(state.unfilteredCount).toBe(4);
    expect(state.filteredCount).toBe(2);
  });

  test('empty filter values (per filterType.emptyValues) are discarded', () => {
    const harness = createDataSourceHarness<Developer>({
      primaryKey: 'id',
      data: developers,
      defaultFilterValue: [],
    });
    harness.setData(developers);
    harness.setStateValue('filterValue', [
      {
        field: 'country',
        filter: { type: 'string', operator: 'includes', value: '' },
      },
    ]);

    expect(harness.getState().filteredCount).toBe(4);
  });

  test('filterFunction filters locally', () => {
    const harness = createDataSourceHarness<Developer>({
      primaryKey: 'id',
      data: developers,
      filterFunction: ({ data }) => data.age > 30,
    });
    expect(harness.getState().filterMode).toBe('local');

    harness.setData(developers);
    expect(harness.getState().dataArray.map((ri: any) => ri.data.name)).toEqual(
      ['Carl', 'Dana'],
    );
  });

  test('groupBy generates group rows followed by their (expanded) leaf rows', () => {
    const harness = createDataSourceHarness<Developer>({
      primaryKey: 'id',
      data: developers,
      groupBy: [{ field: 'country' }],
    });

    harness.setData(developers);
    const state = harness.getState();

    const shape = state.dataArray.map((ri: any) =>
      ri.isGroupRow ? `group:${ri.groupKeys.join('/')}` : `leaf:${ri.id}`,
    );
    expect(shape).toEqual([
      'group:USA',
      'leaf:1',
      'leaf:3',
      'group:France',
      'leaf:2',
      'leaf:4',
    ]);

    const groupRow = state.dataArray[0];
    expect(groupRow).toMatchObject({
      isGroupRow: true,
      groupCount: 2,
    });
  });

  test('sorting + grouping compose: leaf rows are sorted within groups', () => {
    const harness = createDataSourceHarness<Developer>({
      primaryKey: 'id',
      data: developers,
      groupBy: [{ field: 'country' }],
      defaultSortInfo: { field: 'age', dir: -1 },
    });

    harness.setData(developers);
    const state = harness.getState();

    const shape = state.dataArray.map((ri: any) =>
      ri.isGroupRow ? `group:${ri.groupKeys.join('/')}` : `leaf:${ri.id}`,
    );
    // age desc: Carl(40, USA), Dana(35, France), Bob(30, USA), Alice(25, France)
    expect(shape).toEqual([
      'group:USA',
      'leaf:3',
      'leaf:1',
      'group:France',
      'leaf:4',
      'leaf:2',
    ]);
  });

  test('sortInfo { id: group-by, dir } resolves fields from groupBy', () => {
    const harness = createDataSourceHarness<Developer>({
      primaryKey: 'id',
      data: developers,
      groupBy: [{ field: 'country' }],
      defaultSortInfo: { id: 'group-by', dir: 1 },
    });

    harness.setData(developers);
    const state = harness.getState();

    const shape = state.dataArray.map((ri: any) =>
      ri.isGroupRow ? `group:${ri.groupKeys.join('/')}` : `leaf:${ri.id}`,
    );
    expect(shape).toEqual([
      'group:France',
      'leaf:2',
      'leaf:4',
      'group:USA',
      'leaf:1',
      'leaf:3',
    ]);
  });

  test('pivot column sort orders sibling groups by the aggregated pivot cell', () => {
    type Framework = {
      id: number;
      language: string;
      license: string;
      has_wiki: boolean;
      stargazers_count: number;
    };

    const frameworks: Framework[] = [
      {
        id: 1,
        language: 'JavaScript',
        license: 'MIT',
        has_wiki: true,
        stargazers_count: 100,
      },
      {
        id: 2,
        language: 'JavaScript',
        license: 'MIT',
        has_wiki: false,
        stargazers_count: 50,
      },
      {
        id: 3,
        language: 'JavaScript',
        license: 'BSD',
        has_wiki: true,
        stargazers_count: 10,
      },
      {
        id: 4,
        language: 'JavaScript',
        license: 'BSD',
        has_wiki: false,
        stargazers_count: 1000,
      },
      {
        id: 5,
        language: 'TypeScript',
        license: 'MIT',
        has_wiki: true,
        stargazers_count: 200,
      },
      {
        id: 6,
        language: 'TypeScript',
        license: 'MIT',
        has_wiki: false,
        stargazers_count: 1,
      },
    ];

    const harness = createDataSourceHarness<Framework>({
      primaryKey: 'id',
      data: frameworks,
      groupBy: [{ field: 'language' }, { field: 'license' }],
      pivotBy: [{ field: 'has_wiki' }],
      aggregationReducers: {
        stargazers_count: {
          field: 'stargazers_count',
          initialValue: 0,
          reducer: (acc, value) => acc + value,
        },
      },
      defaultSortInfo: {
        id: 'stargazers_count:true',
        dir: 1,
        type: 'number',
      },
    });

    harness.setData(frameworks);
    let state = harness.getState();

    const shape = (s: any) =>
      s.dataArray
        .filter((ri: any) => ri.isGroupRow)
        .map((ri: any) => ri.groupKeys.join('/'));

    expect(shape(state)).toEqual([
      'JavaScript',
      'JavaScript/BSD',
      'JavaScript/MIT',
      'TypeScript',
      'TypeScript/MIT',
    ]);

    const pivotColumnIds = Object.keys(state.pivotColumns || {});
    expect(pivotColumnIds.indexOf('stargazers_count:true')).toBeLessThan(
      pivotColumnIds.indexOf('stargazers_count:false'),
    );

    harness.setStateValue('sortInfo', [
      { id: 'stargazers_count:true', dir: -1, type: 'number' },
    ]);
    state = harness.getState();

    expect(shape(state)).toEqual([
      'TypeScript',
      'TypeScript/MIT',
      'JavaScript',
      'JavaScript/MIT',
      'JavaScript/BSD',
    ]);

    const pivotColumnIdsDesc = Object.keys(state.pivotColumns || {});
    expect(pivotColumnIdsDesc.indexOf('stargazers_count:true')).toBeLessThan(
      pivotColumnIdsDesc.indexOf('stargazers_count:false'),
    );
  });
});

describe('DataSource reducer pipeline - memoization contract', () => {
  test('unrelated state updates do NOT re-run sorting (lastSortDataArray reference reused)', () => {
    const sortFunction = jest.fn((_sortInfo: any, arr: Developer[]) =>
      [...arr].sort((a, b) => a.age - b.age),
    );

    const harness = createDataSourceHarness<Developer>({
      primaryKey: 'id',
      data: developers,
      defaultSortInfo: { field: 'age', dir: 1 },
      sortFunction,
    });

    harness.setData(developers);
    expect(sortFunction).toHaveBeenCalledTimes(1);

    const sortedArrayRef = harness.getState().lastSortDataArray;

    // unrelated update - loading flag - must not re-run the sort
    harness.setStateValue('loading', true);

    expect(sortFunction).toHaveBeenCalledTimes(1);
    expect(harness.getState().lastSortDataArray).toBe(sortedArrayRef);
  });

  test('replacing originalDataArray with a NEW reference re-runs the pipeline (identity-based dep tracking)', () => {
    const sortFunction = jest.fn((_sortInfo: any, arr: Developer[]) =>
      [...arr].sort((a, b) => a.age - b.age),
    );

    const harness = createDataSourceHarness<Developer>({
      primaryKey: 'id',
      data: developers,
      defaultSortInfo: { field: 'age', dir: 1 },
      sortFunction,
    });

    harness.setData(developers);
    expect(sortFunction).toHaveBeenCalledTimes(1);

    // same contents, new array reference -> deps changed -> re-sort
    harness.setData([...developers]);
    expect(sortFunction).toHaveBeenCalledTimes(2);
  });

  test('rowInfo dataArray identity is stable across unrelated updates', () => {
    const harness = createDataSourceHarness<Developer>({
      primaryKey: 'id',
      data: developers,
    });

    harness.setData(developers);
    const dataArrayRef = harness.getState().dataArray;

    harness.setStateValue('loading', true);

    expect(harness.getState().dataArray).toBe(dataArrayRef);
  });
});

describe('DataSource reducer pipeline - tree data', () => {
  test('nodesKey flattens tree with parent and leaf nodes (default expanded)', () => {
    const harness = createDataSourceHarness<TreeNode>({
      primaryKey: 'id',
      data: treeData,
      nodesKey: 'children',
    } as any);

    expect(harness.getState().isTree).toBe(true);

    harness.setData(treeData);
    const state = harness.getState();

    const shape = state.dataArray.map((ri: any) =>
      ri.isParentNode
        ? `parent:${ri.id}:${ri.nodePath.join('/')}`
        : `leaf:${ri.id}:${ri.nodePath.join('/')}`,
    );

    expect(shape).toEqual([
      'parent:root1:root1',
      'leaf:leaf1:root1/leaf1',
      'leaf:leaf2:root1/leaf2',
      'leaf:root2:root2',
    ]);

    expect(state.dataArray[0]).toMatchObject({
      isTreeNode: true,
      totalLeafNodesCount: 2,
    });
  });

  test('treeFilterFunction filters leaf nodes and drops empty parents', () => {
    const harness = createDataSourceHarness<TreeNode>({
      primaryKey: 'id',
      data: treeData,
      nodesKey: 'children',
      treeFilterFunction: ({ data, filterTreeNode }: any) => {
        const node = filterTreeNode(data);
        if (!node) {
          return false;
        }
        if (Array.isArray((node as any).children)) {
          return node;
        }
        return (node as any).name.includes('.doc');
      },
    } as any);

    harness.setData(treeData);
    const state = harness.getState();

    const ids = state.dataArray.map((ri: any) => ri.id);
    expect(ids).toEqual(['root1', 'leaf1']);
  });

  test('column filters without a treeFilterFunction are matched against the leaf nodes', () => {
    const harness = createDataSourceHarness<TreeNode>({
      primaryKey: 'id',
      data: treeData,
      nodesKey: 'children',
      defaultFilterValue: [
        {
          field: 'name',
          filter: { type: 'string', operator: 'includes', value: 'photo' },
        },
      ],
    } as any);

    harness.setData(treeData);

    expect(harness.getState().dataArray.map((ri: any) => ri.id)).toEqual([
      'root1',
      'leaf2',
    ]);
    // the input tree is not modified
    expect(treeData[0].children!.length).toBe(2);
  });

  test('column filters on tree data do not match the fields of parent nodes', () => {
    const harness = createDataSourceHarness<TreeNode>({
      primaryKey: 'id',
      data: treeData,
      nodesKey: 'children',
      defaultFilterValue: [
        {
          field: 'name',
          filter: { type: 'string', operator: 'includes', value: 'documents' },
        },
      ],
    } as any);

    harness.setData(treeData);

    expect(harness.getState().dataArray).toEqual([]);
  });

  test('treeFilterFunction gets isLeafNode and can compose defaultTreeFilterFunction', () => {
    const seen: Record<string, boolean> = {};
    const filterFunction = jest.fn(() => true);

    const harness = createDataSourceHarness<TreeNode>({
      primaryKey: 'id',
      data: treeData,
      nodesKey: 'children',
      filterFunction,
      defaultFilterValue: [
        {
          field: 'name',
          filter: { type: 'string', operator: 'includes', value: '.doc' },
        },
      ],
      treeFilterFunction: (param: any) => {
        seen[param.data.id] = param.isLeafNode;
        return defaultTreeFilterFunction(param);
      },
    } as any);

    harness.setData(treeData);

    expect(harness.getState().dataArray.map((ri: any) => ri.id)).toEqual([
      'root1',
      'leaf1',
    ]);
    expect(seen).toEqual({
      root1: false,
      leaf1: true,
      leaf2: true,
      root2: true,
    });
    // with both, only the treeFilterFunction runs on tree data
    expect(filterFunction).not.toHaveBeenCalled();
  });
});

describe('DataSource defaults - what is done locally and what triggers a reload', () => {
  const dataFn = () => Promise.resolve(developers);

  test('a data function without shouldReloadData does everything locally', () => {
    const harness = createDataSourceHarness<Developer>({
      primaryKey: 'id',
      data: dataFn,
      sortInfo: { field: 'age', dir: 1 },
      defaultFilterValue: [],
    });

    const state = harness.getState();
    expect(state.shouldReloadData).toEqual({
      sortInfo: false,
      filterValue: false,
      groupBy: false,
      pivotBy: false,
    });
    expect(state.sortMode).toBe('local');
    expect(state.filterMode).toBe('local');
  });

  test('lazyLoad defaults every operation to the server', () => {
    const harness = createDataSourceHarness<Developer>({
      primaryKey: 'id',
      data: dataFn,
      lazyLoad: { batchSize: 10 },
    });

    const state = harness.getState();
    expect(state.shouldReloadData).toEqual({
      sortInfo: true,
      filterValue: true,
      groupBy: true,
      pivotBy: true,
    });
    expect(state.sortMode).toBe('remote');
    expect(state.filterMode).toBe('remote');
  });

  test('livePagination defaults sorting and filtering to the server, grouping stays local', () => {
    const harness = createDataSourceHarness<Developer>({
      primaryKey: 'id',
      data: dataFn,
      livePagination: true,
    });

    expect(harness.getState().shouldReloadData).toEqual({
      sortInfo: true,
      filterValue: true,
      groupBy: false,
      pivotBy: false,
    });
  });

  test('an explicit shouldReloadData value wins over the lazyLoad default', () => {
    const harness = createDataSourceHarness<Developer>({
      primaryKey: 'id',
      data: dataFn,
      lazyLoad: true,
      shouldReloadData: { sortInfo: false },
    });

    expect(harness.getState().shouldReloadData.sortInfo).toBe(false);
    expect(harness.getState().shouldReloadData.filterValue).toBe(true);
  });

  test('sortFunction + shouldReloadData.sortInfo: refetch and sort locally', () => {
    const harness = createDataSourceHarness<Developer>({
      primaryKey: 'id',
      data: developers,
      defaultSortInfo: { field: 'age', dir: -1 },
      sortFunction: multisort,
      shouldReloadData: { sortInfo: true },
    });

    expect(harness.getState().shouldReloadData.sortInfo).toBe(true);
    expect(harness.getState().sortMode).toBe('local');

    harness.setData(developers);
    expect(harness.getState().dataArray.map((ri: any) => ri.data.age)).toEqual([
      40, 35, 30, 25,
    ]);
  });

  test('filterFunction + shouldReloadData.filterValue: refetch and filter locally', () => {
    const harness = createDataSourceHarness<Developer>({
      primaryKey: 'id',
      data: developers,
      filterFunction: defaultFilterFunction,
      shouldReloadData: { filterValue: true },
      defaultFilterValue: [],
    });

    expect(harness.getState().shouldReloadData.filterValue).toBe(true);
    expect(harness.getState().filterMode).toBe('local');

    harness.setData(developers);
    harness.setStateValue('filterValue', [
      {
        field: 'country',
        filter: { type: 'string', operator: 'includes', value: 'france' },
      },
    ]);

    expect(harness.getState().dataArray.map((ri: any) => ri.data.name)).toEqual(
      ['Alice', 'Dana'],
    );
  });

  test('under lazyLoad, a filterFunction never runs (rows are placeholders until loaded)', () => {
    const filterFunction = jest.fn(() => true);
    const harness = createDataSourceHarness<Developer>({
      primaryKey: 'id',
      data: dataFn,
      lazyLoad: { batchSize: 2 },
      filterFunction,
    });

    expect(harness.getState().filterMode).toBe('remote');

    harness.setData(developers);
    expect(filterFunction).not.toHaveBeenCalled();
    expect(harness.getState().dataArray.length).toBe(4);
  });
});

describe('DataSource filterFunction replaces the built-in column filtering', () => {
  const franceFilter = [
    {
      field: 'country' as const,
      filter: { type: 'string', operator: 'includes', value: 'france' },
    },
  ];

  test('a filterFunction alone ignores the column filters', () => {
    const harness = createDataSourceHarness<Developer>({
      primaryKey: 'id',
      data: developers,
      defaultFilterValue: franceFilter,
      filterFunction: ({ data }) => data.age > 30,
    });

    harness.setData(developers);
    expect(harness.getState().dataArray.map((ri: any) => ri.data.name)).toEqual(
      ['Carl', 'Dana'],
    );
  });

  test('composing defaultFilterFunction applies both', () => {
    const harness = createDataSourceHarness<Developer>({
      primaryKey: 'id',
      data: developers,
      defaultFilterValue: franceFilter,
      filterFunction: (param) =>
        defaultFilterFunction(param) && param.data.age > 30,
    });

    harness.setData(developers);
    expect(harness.getState().dataArray.map((ri: any) => ri.data.name)).toEqual(
      ['Dana'],
    );
  });

  test('filterFunction={defaultFilterFunction} gives the same rows as the built-in filtering', () => {
    const builtIn = createDataSourceHarness<Developer>({
      primaryKey: 'id',
      data: developers,
      defaultFilterValue: franceFilter,
    });
    const viaFunction = createDataSourceHarness<Developer>({
      primaryKey: 'id',
      data: developers,
      defaultFilterValue: franceFilter,
      filterFunction: defaultFilterFunction,
    });

    builtIn.setData(developers);
    viaFunction.setData(developers);

    expect(viaFunction.getState().dataArray.map((ri: any) => ri.id)).toEqual(
      builtIn.getState().dataArray.map((ri: any) => ri.id),
    );
    expect(builtIn.getState().dataArray.map((ri: any) => ri.id)).toEqual([
      2, 4,
    ]);
  });

  test('the filter function param carries filterValue and filterTypes', () => {
    const params: any[] = [];
    const harness = createDataSourceHarness<Developer>({
      primaryKey: 'id',
      data: developers,
      defaultFilterValue: franceFilter,
      filterFunction: (param) => {
        params.push(param);
        return true;
      },
    });

    harness.setData(developers);
    expect(params.length).toBe(4);
    expect(params[0].filterValue).toEqual(franceFilter);
    expect(Object.keys(params[0].filterTypes)).toEqual(
      expect.arrayContaining(['string', 'number']),
    );
  });

  test('the column filter operator runs once per row', () => {
    const fn = jest.fn(({ currentValue, filterValue }: any) =>
      String(currentValue).toLowerCase().includes(filterValue),
    );
    const harness = createDataSourceHarness<Developer>({
      primaryKey: 'id',
      data: developers,
      filterTypes: {
        text: {
          defaultOperator: 'has',
          emptyValues: [''],
          operators: [{ name: 'has', fn }],
        },
      },
      defaultFilterValue: [
        {
          field: 'country',
          filter: { type: 'text', operator: 'has', value: 'usa' },
        },
      ],
      filterFunction: defaultFilterFunction,
    });

    harness.setData(developers);
    expect(fn).toHaveBeenCalledTimes(4);
    expect(harness.getState().dataArray.map((ri: any) => ri.id)).toEqual([
      1, 3,
    ]);
  });
});

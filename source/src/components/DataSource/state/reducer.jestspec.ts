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

  test('controlled sortInfo -> sortMode remote -> NO local sorting is applied', () => {
    const harness = createDataSourceHarness<Developer>({
      primaryKey: 'id',
      data: developers,
      sortInfo: { field: 'age', dir: 1 },
    });

    expect(harness.getState().sortMode).toBe('remote');
    expect(harness.getState().controlledSort).toBe(true);

    harness.setData(developers);
    const state = harness.getState();

    // data stays in the original order - the server is expected to sort
    expect(state.dataArray.map((ri: any) => ri.data.age)).toEqual([
      30, 25, 40, 35,
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
});

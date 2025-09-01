import { DataSourceApi, DataSourceComponentActions } from '.';

import {
  InfiniteTable_Tree_RowInfoLeafNode,
  InfiniteTableRowInfo,
} from '../InfiniteTable/types';
import { getRowInfoAt } from './dataSourceGetters';
import { NodePath, TreeExpandState } from './TreeExpandState';
import {
  GetTreeSelectionStateConfig,
  TreeSelectionState,
  TreeSelectionStateObject,
} from './TreeSelectionState';
import { DataSourceState } from './types';

export type GetTreeSelectionApiParam<T> = {
  getState: () => DataSourceState<T>;
  actions: {
    treeSelection: DataSourceComponentActions<T>['treeSelection'];
  };
};
export function cloneTreeSelection<T>(
  treeSelection: TreeSelectionState<T> | TreeSelectionStateObject,
  stateOrGetState: DataSourceState<T> | (() => DataSourceState<T>),
) {
  return new TreeSelectionState<T>(
    treeSelection,
    treeSelectionStateConfigGetter(stateOrGetState),
  );
}

type ForceOptions = { force?: boolean };

export type TreeExpandStateApi<T> = {
  isNodeExpanded(nodePath: any[]): boolean;
  isNodeReadOnly(nodePath: any[]): boolean;

  expandNode(nodePath: any[], options?: ForceOptions): void;
  collapseNode(nodePath: any[], options?: ForceOptions): void;

  toggleNode(nodePath: any[], options?: ForceOptions): void;

  getNodeDataByPath(nodePath: any[]): T | null;
  getRowInfoByPath(nodePath: any[]): InfiniteTableRowInfo<T> | null;
};

type TreeSelectionApi<T = any> = {
  get allRowsSelected(): boolean;
  isNodeSelected(nodePath: NodePath): boolean | null;

  selectNode(nodePath: NodePath, options?: ForceOptions): void;
  setNodeSelection(
    nodePath: NodePath,
    selected: boolean,
    options?: ForceOptions,
  ): void;
  deselectNode(nodePath: NodePath, options?: ForceOptions): void;
  toggleNodeSelection(nodePath: NodePath, options?: ForceOptions): void;

  selectAll(): void;
  expandAll(): void;
  collapseAll(): void;
  deselectAll(): void;

  getSelectedLeafNodePaths(config?: {
    rootNodePath?: NodePath;
    treeSelectionState?: TreeSelectionState<T>;
  }): NodePath[];
  getDeselectedLeafNodePaths(config?: {
    rootNodePath?: NodePath;
    treeSelectionState?: TreeSelectionState<T>;
  }): NodePath[];
  getSelectedLeafRowInfos(config?: {
    rootNodePath?: NodePath;
    treeSelectionState?: TreeSelectionState<T>;
  }): InfiniteTable_Tree_RowInfoLeafNode<T>[];
};

export type TreeApi<T> = TreeExpandStateApi<T> & TreeSelectionApi<T>;

export type GetTreeApiParam<T> = {
  getState: () => DataSourceState<T>;
  dataSourceApi: DataSourceApi<T>;
  actions: DataSourceComponentActions<T>;
};

export function treeSelectionStateConfigGetter<T>(
  stateOrStateGetter: DataSourceState<T> | (() => DataSourceState<T>),
): GetTreeSelectionStateConfig<T> {
  return () => {
    const state =
      typeof stateOrStateGetter === 'function'
        ? stateOrStateGetter()
        : stateOrStateGetter;

    return {
      treePaths: state.treePaths!,
      treeDeepMap: state.treeDeepMap!,
    };
  };
}

export class TreeApiImpl<T> implements TreeApi<T> {
  private getState: () => DataSourceState<T>;
  private actions: DataSourceComponentActions<T>;
  private dataSourceApi: DataSourceApi<T>;

  constructor(param: GetTreeApiParam<T>) {
    this.getState = param.getState;
    this.actions = param.actions;
    this.dataSourceApi = param.dataSourceApi;
  }

  getSelectedLeafNodePaths(config?: {
    rootNodePath?: NodePath;
    treeSelectionState?: TreeSelectionState<T>;
  }): NodePath[] {
    const { treePaths } = this.getState();
    const treeSelectionState =
      config?.treeSelectionState || this.getState().treeSelectionState;

    if (!treeSelectionState) {
      return [];
    }

    return treeSelectionState.getSelectedLeafNodePaths(
      config?.rootNodePath,
      treePaths,
    );
  }

  getDeselectedLeafNodePaths(config?: {
    rootNodePath?: NodePath;
    treeSelectionState?: TreeSelectionState<T>;
  }): NodePath[] {
    const { treePaths } = this.getState();
    const treeSelectionState =
      config?.treeSelectionState || this.getState().treeSelectionState;

    if (!treeSelectionState) {
      return [];
    }

    return treeSelectionState.getDeselectedLeafNodePaths(
      config?.rootNodePath,
      treePaths,
    );
  }

  getSelectedLeafRowInfos(config?: {
    rootNodePath?: NodePath;
    treeSelectionState?: TreeSelectionState<T>;
  }): InfiniteTable_Tree_RowInfoLeafNode<T>[] {
    const { treePaths } = this.getState();
    const treeSelectionState =
      config?.treeSelectionState || this.getState().treeSelectionState;

    if (!treePaths || !treeSelectionState) {
      return [];
    }
    const rootNodePath = config?.rootNodePath || [];

    const selectedLeafRowInfos: InfiniteTable_Tree_RowInfoLeafNode<T>[] = [];

    treePaths.getLeafNodesStartingWith(
      rootNodePath,
      (pair) => {
        if (treeSelectionState.isNodeSelected(pair.keys)) {
          const rowInfo = this.getRowInfoByPath(
            pair.keys,
          ) as InfiniteTable_Tree_RowInfoLeafNode<T>;
          if (rowInfo) {
            selectedLeafRowInfos.push(rowInfo);
          }
        }
      },
      { excludeSelf: true },
    );

    return selectedLeafRowInfos;
  }

  setNodeSelection = (
    nodePath: NodePath,
    selected: boolean,
    options?: { force?: boolean },
  ) => {
    const { treeSelectionState: treeSelection, selectionMode } =
      this.getState();

    if (!this.isNodeSelectable(nodePath) && !options?.force) {
      return;
    }

    if (selectionMode === 'single-row') {
      this.actions.treeSelection = selected
        ? (nodePath[nodePath.length - 1] as any)
        : null;
      return;
    }

    if (selectionMode !== 'multi-row') {
      throw 'Selection mode is not multi-row or single-row';
    }
    if (!(treeSelection instanceof TreeSelectionState)) {
      throw 'Invalid tree selection';
    }

    const treeSelectionState = new TreeSelectionState(
      treeSelection,
      treeSelectionStateConfigGetter(this.getState),
    );

    treeSelectionState.setNodeSelection(nodePath, selected);
    this.getState().lastSelectionUpdatedNodePathRef.current = nodePath;
    this.actions.treeSelection = treeSelectionState;
  };
  get allRowsSelected() {
    return this.getState().allRowsSelected;
  }
  isNodeReadOnly(nodePath: any[]) {
    const rowInfo = this.getRowInfoByPath(nodePath);
    const isNodeReadOnly = this.getState().isNodeReadOnly;
    return rowInfo &&
      rowInfo.isTreeNode &&
      rowInfo.isParentNode &&
      isNodeReadOnly
      ? isNodeReadOnly(rowInfo)
      : false;
  }
  isNodeSelectable(nodePath: any[]) {
    const rowInfo = this.getRowInfoByPath(nodePath);
    const isNodeSelectable = this.getState().isNodeSelectable;

    return rowInfo && rowInfo.isTreeNode ? isNodeSelectable(rowInfo) : false;
  }
  isNodeExpanded(nodePath: any[]) {
    const state = this.getState();
    const { isNodeExpanded, isNodeCollapsed, treeExpandState } = state;

    const rowInfo = this.getRowInfoByPath(nodePath);

    if (rowInfo) {
      if (!rowInfo.isTreeNode || !rowInfo.isParentNode) {
        return false;
      }
      if (isNodeCollapsed) {
        return !isNodeExpanded!(rowInfo, treeExpandState);
      }
      if (isNodeExpanded) {
        return isNodeExpanded!(rowInfo, treeExpandState);
      }
    }

    return treeExpandState.isNodeExpanded(nodePath);
  }

  expandAll() {
    const treeExpandState = new TreeExpandState<T>({
      defaultExpanded: true,
      collapsedPaths: [],
    });

    this.getState().lastExpandStateInfoRef.current = {
      state: 'expanded',
      nodePath: null,
    };
    this.actions.treeExpandState = treeExpandState;
  }

  collapseAll() {
    const treeExpandState = new TreeExpandState<T>({
      defaultExpanded: false,
      expandedPaths: [],
    });

    this.getState().lastExpandStateInfoRef.current = {
      state: 'collapsed',
      nodePath: null,
    };
    this.actions.treeExpandState = treeExpandState;
  }

  expandNode(nodePath: any[], options?: { force?: boolean }) {
    if (this.isNodeReadOnly(nodePath) && !options?.force) {
      return;
    }
    const state = this.getState();
    const treeExpandState = new TreeExpandState<T>(state.treeExpandState);
    treeExpandState.expandNode(nodePath);

    this.getState().lastExpandStateInfoRef.current = {
      state: 'expanded',
      nodePath,
    };
    this.actions.treeExpandState = treeExpandState;

    state.onNodeExpand?.(nodePath, this.getCallbackParam(nodePath));
  }
  private getCallbackParam = (_nodePath: NodePath) => {
    return {
      dataSourceApi: this.dataSourceApi,
    };
  };
  collapseNode(nodePath: any[], options?: { force?: boolean }) {
    if (this.isNodeReadOnly(nodePath) && !options?.force) {
      return;
    }
    const state = this.getState();
    const treeExpandState = new TreeExpandState<T>(state.treeExpandState);
    treeExpandState.collapseNode(nodePath);

    this.getState().lastExpandStateInfoRef.current = {
      state: 'collapsed',
      nodePath,
    };
    this.actions.treeExpandState = treeExpandState;

    state.onNodeCollapse?.(nodePath, this.getCallbackParam(nodePath));
  }

  toggleNode(nodePath: any[], options?: { force?: boolean }) {
    const state = this.getState();
    const treeExpandState = new TreeExpandState<T>(state.treeExpandState);
    const newExpanded = !this.isNodeExpanded(nodePath);

    if (this.isNodeReadOnly(nodePath) && !options?.force) {
      return;
    }
    treeExpandState.setNodeExpanded(nodePath, newExpanded);

    this.getState().lastExpandStateInfoRef.current = {
      state: newExpanded ? 'expanded' : 'collapsed',
      nodePath,
    };
    this.actions.treeExpandState = treeExpandState;

    if (newExpanded) {
      state.onNodeExpand?.(nodePath, this.getCallbackParam(nodePath));
    } else {
      state.onNodeCollapse?.(nodePath, this.getCallbackParam(nodePath));
    }
  }

  getNodeDataByPath(nodePath: any[]) {
    const { treeDeepMap } = this.getState();
    if (!treeDeepMap || !nodePath.length) {
      return null;
    }

    const rowInfo = this.getRowInfoByPath(nodePath);
    return rowInfo ? (rowInfo.data as T) : null;
  }
  getRowInfoByPath(nodePath: any[]) {
    const { pathToIndexMap } = this.getState();

    const index = pathToIndexMap.get(nodePath);
    if (index !== undefined) {
      return getRowInfoAt(index, this.getState);
    }
    return null;
  }

  selectAll() {
    const { treeSelectionState: treeSelection, selectionMode } =
      this.getState();

    if (selectionMode !== 'multi-row') {
      throw 'Selection mode is not multi-row';
    }
    if (!(treeSelection instanceof TreeSelectionState)) {
      throw 'Invalid node selection';
    }

    const treeSelectionState = new TreeSelectionState(
      treeSelection,
      treeSelectionStateConfigGetter(this.getState),
    );

    treeSelectionState.selectAll();

    this.getState().lastSelectionUpdatedNodePathRef.current = null;
    this.actions.treeSelection = treeSelectionState;
  }

  deselectAll() {
    const { treeSelectionState: treeSelection, selectionMode } =
      this.getState();

    if (selectionMode !== 'multi-row') {
      throw 'Selection mode is not multi-row';
    }
    if (!(treeSelection instanceof TreeSelectionState)) {
      throw 'Invalid node selection';
    }

    const treeSelectionState = new TreeSelectionState(
      treeSelection,
      treeSelectionStateConfigGetter(this.getState),
    );

    treeSelectionState.deselectAll();
    this.getState().lastSelectionUpdatedNodePathRef.current = null;
    this.actions.treeSelection = treeSelectionState;
  }
  isNodeSelected(nodePath: NodePath) {
    const {
      treeSelectionState,
      treeSelection: singleTreeSelection,
      selectionMode,
    } = this.getState();

    if (selectionMode === 'single-row') {
      const pk = nodePath[nodePath.length - 1];
      if (Array.isArray(singleTreeSelection)) {
        // @ts-ignore
        return treeSelection.join(',') === nodePath.join(',');
      }
      return (singleTreeSelection as any) === pk;
    }

    if (selectionMode !== 'multi-row') {
      throw 'Selection mode is not multi-row or single-row';
    }
    if (!(treeSelectionState instanceof TreeSelectionState)) {
      throw 'Invalid tree selection';
    }

    return treeSelectionState.isNodeSelected(nodePath);
  }

  selectNode(nodePath: NodePath, options?: { force?: boolean }) {
    this.setNodeSelection(nodePath, true, options);
  }

  deselectNode(nodePath: NodePath, options?: { force?: boolean }) {
    this.setNodeSelection(nodePath, false, options);
  }

  toggleNodeSelection(nodePath: NodePath, options?: { force?: boolean }) {
    if (this.isNodeSelected(nodePath)) {
      this.deselectNode(nodePath, options);
    } else {
      this.selectNode(nodePath, options);
    }
  }
}

export function getTreeApi<T>(param: GetTreeApiParam<T>): TreeApi<T> {
  return new TreeApiImpl(param);
}

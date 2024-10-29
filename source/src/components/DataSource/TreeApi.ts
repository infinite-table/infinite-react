import { DataSourceApi, DataSourceComponentActions } from '.';

import { InfiniteTableRowInfo } from '../InfiniteTable/types';
import { getRowInfoAt } from './dataSourceGetters';
import { isNodeExpandable } from './state/reducer';
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

export type TreeExpandStateApi<T> = {
  isNodeExpanded(nodePath: any[]): boolean;
  isNodeExpandable(nodePath: any[]): boolean;

  expandNode(nodePath: any[]): void;
  collapseNode(nodePath: any[]): void;

  toggleNode(nodePath: any[]): void;

  getNodeDataByPath(nodePath: any[]): T | null;
  getRowInfoByPath(nodePath: any[]): InfiniteTableRowInfo<T> | null;
};

type TreeSelectionApi<_T = any> = {
  get allRowsSelected(): boolean;
  isNodeSelected(nodePath: NodePath): boolean | null;

  selectNode(nodePath: NodePath): void;
  setNodeSelection(nodePath: NodePath, selected: boolean): void;
  deselectNode(nodePath: NodePath): void;
  toggleNodeSelection(nodePath: NodePath): void;

  selectAll(): void;
  expandAll(): void;
  collapseAll(): void;
  deselectAll(): void;
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

  setNodeSelection = (nodePath: NodePath, selected: boolean) => {
    const { treeSelectionState: treeSelection, selectionMode } =
      this.getState();

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
  isNodeExpandable(nodePath: any[]) {
    const rowInfo = this.getRowInfoByPath(nodePath);
    return rowInfo && rowInfo.isTreeNode && rowInfo.isParentNode
      ? isNodeExpandable(rowInfo)
      : false;
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
        return !isNodeExpanded!(rowInfo);
      }
      if (isNodeExpanded) {
        return isNodeExpanded!(rowInfo);
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

  expandNode(nodePath: any[]) {
    if (!this.isNodeExpandable(nodePath)) {
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
  collapseNode(nodePath: any[]) {
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

  toggleNode(nodePath: any[]) {
    const state = this.getState();
    const treeExpandState = new TreeExpandState<T>(state.treeExpandState);
    const newExpanded = !this.isNodeExpanded(nodePath);

    if (!this.isNodeExpandable(nodePath)) {
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
    const { pathToIndexDeepMap } = this.getState();

    const index = pathToIndexDeepMap.get(nodePath);
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

  selectNode(nodePath: NodePath) {
    this.setNodeSelection(nodePath, true);
  }

  deselectNode(nodePath: NodePath) {
    this.setNodeSelection(nodePath, false);
  }

  toggleNodeSelection(nodePath: NodePath) {
    if (this.isNodeSelected(nodePath)) {
      this.deselectNode(nodePath);
    } else {
      this.selectNode(nodePath);
    }
  }
}

export function getTreeApi<T>(param: GetTreeApiParam<T>): TreeApi<T> {
  return new TreeApiImpl(param);
}

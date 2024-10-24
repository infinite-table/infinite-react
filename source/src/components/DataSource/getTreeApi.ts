import { DataSourceComponentActions } from '.';

import { InfiniteTableRowInfo } from '../InfiniteTable/types';
import { getRowInfoAt } from './dataSourceGetters';
import { NodePath, TreeExpandState } from './TreeExpandState';
import {
  GetTreeSelectionStateConfig,
  TreeSelectionState,
  TreeSelectionStateObject,
} from './TreeSelectionState';
import { DataSourceState } from './types';

export type TreeExpandStateApi<T> = {
  isNodeExpanded(nodePath: any[]): boolean;

  expandNode(nodePath: any[]): void;
  collapseNode(nodePath: any[]): void;

  toggleNode(nodePath: any[]): void;

  getNodeDataByPath(nodePath: any[]): T | null;
  getRowInfoByPath(nodePath: any[]): InfiniteTableRowInfo<T> | null;
};

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

type TreeSelectionApi = {
  get allRowsSelected(): boolean;
  isNodeSelected(nodePath: NodePath): boolean | null;

  selectNode(nodePath: NodePath): void;
  setNodeSelection(nodePath: NodePath, selected: boolean): void;
  deselectNode(nodePath: NodePath): void;
  toggleNodeSelection(nodePath: NodePath): void;

  selectAll(): void;
  deselectAll(): void;
};
export type TreeApi<T> = TreeExpandStateApi<T> & TreeSelectionApi;

export type GetTreeApiParam<T> = {
  getState: () => DataSourceState<T>;
  actions: {
    treeExpandState: DataSourceComponentActions<T>['treeExpandState'];
    treeSelection: DataSourceComponentActions<T>['treeSelection'];
  };
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
      treePaths: state.treePaths!,
    };
  };
}

export function getTreeApi<T>(param: GetTreeApiParam<T>): TreeApi<T> {
  const { getState, actions } = param;

  const setNodeSelection = (nodePath: NodePath, selected: boolean) => {
    const { treeSelectionState: treeSelection, selectionMode } = getState();

    if (selectionMode === 'single-row') {
      actions.treeSelection = selected
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
      treeSelectionStateConfigGetter(getState),
    );

    treeSelectionState.setNodeSelection(nodePath, selected);
    actions.treeSelection = treeSelectionState;
  };

  const api = {
    get allRowsSelected() {
      return getState().allRowsSelected;
    },
    isNodeExpanded(nodePath: any[]) {
      return getState().treeExpandState.isNodeExpanded(nodePath);
    },

    expandNode(nodePath: any[]) {
      const state = getState();
      const treeExpandState = new TreeExpandState<T>(state.treeExpandState);
      treeExpandState.expandNode(nodePath);
      actions.treeExpandState = treeExpandState;
    },
    collapseNode(nodePath: any[]) {
      const state = getState();
      const treeExpandState = new TreeExpandState<T>(state.treeExpandState);
      treeExpandState.collapseNode(nodePath);
      actions.treeExpandState = treeExpandState;
    },
    toggleNode(nodePath: any[]) {
      const state = getState();
      const treeExpandState = new TreeExpandState<T>(state.treeExpandState);
      treeExpandState.setNodeExpanded(nodePath, !api.isNodeExpanded(nodePath));

      actions.treeExpandState = treeExpandState;
    },

    getNodeDataByPath(nodePath: any[]) {
      const { treeDeepMap } = getState();
      if (!treeDeepMap || !nodePath.length) {
        return null;
      }

      const rowInfo = api.getRowInfoByPath(nodePath);
      return rowInfo ? (rowInfo.data as T) : null;
    },
    getRowInfoByPath(nodePath: any[]) {
      const { pathToIndexDeepMap } = getState();

      const index = pathToIndexDeepMap.get(nodePath);
      if (index !== undefined) {
        return getRowInfoAt(index, getState);
      }
      return null;
    },

    selectAll() {
      const { treeSelectionState: treeSelection, selectionMode } = getState();

      if (selectionMode !== 'multi-row') {
        throw 'Selection mode is not multi-row';
      }
      if (!(treeSelection instanceof TreeSelectionState)) {
        throw 'Invalid node selection';
      }

      const treeSelectionState = new TreeSelectionState(
        treeSelection,
        treeSelectionStateConfigGetter(getState),
      );

      treeSelectionState.selectAll();
      actions.treeSelection = treeSelectionState;
    },

    deselectAll() {
      const { treeSelectionState: treeSelection, selectionMode } = getState();

      if (selectionMode !== 'multi-row') {
        throw 'Selection mode is not multi-row';
      }
      if (!(treeSelection instanceof TreeSelectionState)) {
        throw 'Invalid node selection';
      }

      const treeSelectionState = new TreeSelectionState(
        treeSelection,
        treeSelectionStateConfigGetter(getState),
      );

      treeSelectionState.deselectAll();
      actions.treeSelection = treeSelectionState;
    },
    isNodeSelected(nodePath: NodePath) {
      const { treeSelection, selectionMode } = getState();

      if (selectionMode === 'single-row') {
        const pk = nodePath[nodePath.length - 1];
        if (Array.isArray(treeSelection)) {
          return treeSelection.join(',') === nodePath.join(',');
        }
        return (treeSelection as any) === pk;
      }

      if (selectionMode !== 'multi-row') {
        throw 'Selection mode is not multi-row or single-row';
      }
      if (!(treeSelection instanceof TreeSelectionState)) {
        throw 'Invalid tree selection';
      }

      return treeSelection.isNodeSelected(nodePath);
    },

    selectNode(nodePath: NodePath) {
      setNodeSelection(nodePath, true);
    },

    deselectNode(nodePath: NodePath) {
      setNodeSelection(nodePath, false);
    },
    setNodeSelection(nodePath: NodePath, selected: boolean) {
      setNodeSelection(nodePath, selected);
    },

    toggleNodeSelection(nodePath: NodePath) {
      if (this.isNodeSelected(nodePath)) {
        this.deselectNode(nodePath);
      } else {
        this.selectNode(nodePath);
      }
    },
  };
  return api;
}

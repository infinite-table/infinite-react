import * as React from 'react';
import { InfiniteTable } from '../InfiniteTable';
import { TreeGridProps, TreeSelectionState } from './types/TreeGridProps';
import {
  DataSourcePropOnTreeSelectionChange_MultiNode,
  TreeSelectionStateObject,
} from '../DataSource';

export function TreeGrid<T>(props: TreeGridProps<T>) {
  return <InfiniteTable {...props} />;
}

export const withSelectedLeafNodesOnly = (
  callback: (treeSelectionObject: TreeSelectionStateObject) => void,
) => {
  const onTreeSelectionChange: DataSourcePropOnTreeSelectionChange_MultiNode = (
    _,
    {
      unfilteredTreePaths,
      treeSelectionState,
      prevTreeSelectionState,
      lastUpdatedNodeInfo,
    },
  ) => {
    const newTreeSelection = new TreeSelectionState(prevTreeSelectionState, {
      treePaths: unfilteredTreePaths,
    });

    treeSelectionState.forEachLeafNodePath((nodePath, { selected }) => {
      newTreeSelection.setNodeSelection(nodePath, selected);
    });

    if (lastUpdatedNodeInfo) {
      treeSelectionState.forEachLeafNodePath((nodePath) => {
        newTreeSelection.setNodeSelection(
          nodePath,
          lastUpdatedNodeInfo.selected,
        );
      }, lastUpdatedNodeInfo.nodePath);
    }

    const selectedPaths = newTreeSelection.getSelectedLeafNodePaths();

    const treeSelectionObject: TreeSelectionStateObject = {
      defaultSelection: false,
      selectedPaths,
    };

    callback(treeSelectionObject);
  };

  return onTreeSelectionChange;
};

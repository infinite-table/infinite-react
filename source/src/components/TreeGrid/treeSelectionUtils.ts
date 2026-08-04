/**
 * Framework-neutral tree selection helper, extracted from TreeGrid.tsx so
 * the Vue (and future framework) siblings can share it.
 */
import { TreeSelectionState } from '../DataSource/TreeSelectionState';
import type { TreeSelectionStateObject } from '../DataSource/TreeSelectionState';
import type { DataSourcePropOnTreeSelectionChange_MultiNode } from '../DataSource/types';

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

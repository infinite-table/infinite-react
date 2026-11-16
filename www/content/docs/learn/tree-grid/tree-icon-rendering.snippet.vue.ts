// Code shown on the Vue version of tree-icon-rendering.page.md: the sibling of
// tree-icon-rendering.snippet.tsx, with the same `#region` names.
// Type-checked with vue-tsc against the current source.
//
// The regions that are the same code in React and Vue are shown from the .tsx
// file (the fences marked `neutral` in the page).
import { h, type FunctionalComponent } from 'vue';
import { type InfiniteTableColumn } from '@infinite-table/infinite-vue';

type FileSystemNode = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  extension?: string;
  sizeInKB: number;
  children?: FileSystemNode[];
};

declare const FileIcon: FunctionalComponent;
declare const FolderIcon: FunctionalComponent<{
  open: boolean;
  onClick: () => void;
}>;

// the page shows `toggleCurrentTreeNode` as a free variable:
// it is a property of the `renderTreeIcon` argument, next to `rowInfo`
export function parentNodeCheck(toggleCurrentTreeNode: () => void) {
  //#region checking-if-the-node-is-a-parent-node
  const renderTreeIcon: InfiniteTableColumn<FileSystemNode>['renderTreeIcon'] = ({ rowInfo }) => {
    if (!rowInfo.isParentNode) {
      // rowInfo.nodeExpanded not available here
      return h(FileIcon);
    }

    // it's now OK for TS to use rowInfo.nodeExpanded
    return h(FolderIcon, { open: rowInfo.nodeExpanded, onClick: toggleCurrentTreeNode });
  };
  //#endregion
  return renderTreeIcon;
}

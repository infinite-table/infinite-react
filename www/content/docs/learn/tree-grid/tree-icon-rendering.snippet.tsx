// Snippets shown on tree-icon-rendering.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import { type InfiniteTableColumn } from '@infinite-table/infinite-react';

type FileSystemNode = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  extension?: string;
  sizeInKB: number;
  children?: FileSystemNode[];
};

declare function FileIcon(): React.ReactElement;
declare function FolderIcon(props: {
  open: boolean;
  onClick: () => void;
}): React.ReactElement;

export function treeIconColumn() {
  //#region specifying-the-tree-icon-for-a-column
  const columns: Record<string, InfiniteTableColumn<FileSystemNode>> = {
    name: {
      field: 'name',
      renderTreeIcon: true, // #highlight
    },
    type: { field: 'type' },
    extension: { field: 'extension' },
    size: { field: 'sizeInKB', type: 'number' },
  };
  //#endregion
  return columns;
}

// the page shows `toggleCurrentTreeNode` as a free variable:
// it is a property of the `renderTreeIcon` argument, next to `rowInfo`
export function parentNodeCheck(toggleCurrentTreeNode: () => void) {
  //#region checking-if-the-node-is-a-parent-node
  const renderTreeIcon: InfiniteTableColumn<FileSystemNode>['renderTreeIcon'] = ({ rowInfo }) => {
    if (!rowInfo.isParentNode) {
      // rowInfo.nodeExpanded not available here
      return <FileIcon />;
    }

    // it's now OK for TS to use rowInfo.nodeExpanded
    return  <FolderIcon open={rowInfo.nodeExpanded} onClick={toggleCurrentTreeNode} />
  };
  //#endregion
  return renderTreeIcon;
}

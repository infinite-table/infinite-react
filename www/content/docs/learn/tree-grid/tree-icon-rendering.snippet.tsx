// Snippets shown on tree-icon-rendering.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';

{
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
}

{
  //#region checking-if-the-node-is-a-parent-node
  const renderTreeIcon = ({ rowInfo }) => {
    if (!rowInfo.isParentNode) {
      // rowInfo.nodeExpanded not available here
      return <FileIcon />;
    }

    // it's now OK for TS to use rowInfo.nodeExpanded
    return  <FolderIcon open={rowInfo.nodeExpanded} onClick={toggleCurrentTreeNode} />
  };
  //#endregion
}

export {};

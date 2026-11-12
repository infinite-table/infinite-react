// Snippets shown on tree-column.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';

{
  //#region specifying-the-tree-column
  const columns: Record<string, InfiniteTableColumn<FileSystemNode>> = {
    name: { 
      renderTreeIcon: true, // #highlight
      field: 'name',
      header: 'Name' 
    },
    type: { field: 'type', header: 'Type' },
    size: { field: 'sizeInKB', type: 'number', header: 'Size (KB)' },
  };
  //#endregion
}

export {};

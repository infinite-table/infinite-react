// Snippets shown on column-headers.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).

//#region customizing-the-menu-icon
import {
  useInfiniteHeaderCell,
} from '@infinite-table/infinite-react';

/// ...

renderMenuIcon(){
  const { column } = useInfiniteHeaderCell(); // #highlight
  return `🔧 ${column.id}`;
},
//#endregion

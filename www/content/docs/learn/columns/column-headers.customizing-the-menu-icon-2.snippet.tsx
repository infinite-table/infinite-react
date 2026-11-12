// Snippets shown on column-headers.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).

//#region customizing-the-menu-icon-2
import {
  useInfiniteHeaderCell,
} from '@infinite-table/infinite-react';

/// ...

renderMenuIcon(){
  const { filtered } = useInfiniteHeaderCell(); // #highlight
  return filtered ? '🔥' : '';
},
//#endregion

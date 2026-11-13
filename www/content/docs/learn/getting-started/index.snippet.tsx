// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).

//#region css-import
import '@infinite-table/infinite-react/index.css';
//#endregion

//#region typescript-types
import {
  InfiniteTablePropColumns, // or accessible as InfiniteTableProps['columns']
  // corresponding to the `columns` prop
  DataSourcePropGroupBy, // or accessible as DataSourceProps['groupBy']
  // corresponding to the `groupBy` prop
} from '@infinite-table/infinite-react';
//#endregion

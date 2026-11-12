// Snippets shown on fixed-and-flexible-size.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  InfiniteTablePropColumnSizing,
} from '@infinite-table/infinite-react';

{
  //#region controlled-column-sizing
  const columnSizing: InfiniteTablePropColumnSizing = {
    country: {
      flex: 1,
      // minWidth is optional
      minWidth: 200,
    },
    city: {
      width: 400,
      // and so is maxWidth
      maxWidth: 500,
    },
    salary: {
      flex: 3,
    },
  };
  // any column not specified in the columnSizing (or defaultColumnSizing) prop
  // will have fixed width (defaulting to `columnDefaultWidth`, which in turn defaults to 200px)
  //#endregion
}

{
  //#region resizing-columns-via-drag-drop
  const columns = {
    first: { flex: 1, field: 'one' },
    second: { flex: 2, field: 'two' },
  };
  //#endregion
}

{
  //#region resizing-columns-via-drag-drop-2
  {
    first: { flex: 400 },
    second: {flex: 400 }
  }
  //#endregion
}

export {};

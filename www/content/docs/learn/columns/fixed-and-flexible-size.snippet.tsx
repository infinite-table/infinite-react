// Snippets shown on fixed-and-flexible-size.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import type {
  InfiniteTableColumn,
  InfiniteTablePropColumnSizing,
} from '@infinite-table/infinite-react';

type Data = {
  one: string;
  two: string;
};

export function controlledColumnSizing() {
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
  return columnSizing;
}

export function flexColumns() {
  //#region resizing-columns-via-drag-drop
  const columns = {
    first: { defaultFlex: 1, field: 'one' },
    second: { defaultFlex: 2, field: 'two' },
  };
  //#endregion

  // the snippet has no type annotation, so check it against the column type here
  // (without `field`, which is just a `string` in an object that has no annotation)
  const checked: Record<string, Omit<InfiniteTableColumn<Data>, 'field'>> = columns;
  return checked;
}

// what `onColumnSizingChange` is called with
export const columnSizingAfterResize: InfiniteTablePropColumnSizing = (
  //#region column-sizing-after-resize
  {
    first: { flex: 400 },
    second: {flex: 400 }
  }
  //#endregion
);

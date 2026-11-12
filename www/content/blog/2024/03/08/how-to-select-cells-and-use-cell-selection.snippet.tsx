// Snippets shown on how-to-select-cells-and-use-cell-selection.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import type { DataSourceProps } from '@infinite-table/infinite-react';

type Developer = {
  id: string;
  firstName: string;
  stack: string;
};

// The post shows only the prop it is about, so this stands in for the real
// `DataSource`: the same props, none of them required (`data` and `primaryKey`
// are left out of the shown code).
declare function DataSource(props: Partial<DataSourceProps<Developer>>): React.JSX.Element;

export function MultipleCellSelection() {
  //#region multiple-cell-selection
  <DataSource selectionMode="multi-cell" />
  //#endregion
  return null;
}

{
  //#region include-list-selecting-all-cells-in-a-column
  const defaultCellSelection = {
    defaultSelection: false, // all cells are deselected by default
    selectedCells: [
      // all cells in the stack column
      ['*', 'stack'],
      // also this specific cell
      ['row2', 'firstName'],
    ],
  };
  //#endregion
}

{
  //#region include-list-selecting-all-cells-in-a-row
  const defaultCellSelection = {
    defaultSelection: false, // all cells are deselected by default
    selectedCells: [
      // all cells in the row
      ['row1', '*'],
      // also this specific cell
      ['row2', 'firstName'],
    ],
  };
  //#endregion
}

{
  //#region exclude-list-selecting-everything-except-a
  const defaultCellSelection = {
    defaultSelection: true, // all cells are selected by default
    deselectedCells: [['*', 'stack']],
  };
  //#endregion
}

export {};

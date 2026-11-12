// Snippets shown on how-to-select-cells-and-use-cell-selection.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
} from '@infinite-table/infinite-react';

{
  //#region multiple-cell-selection
  <DataSource selectionMode="multi-cell" />
  //#endregion
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

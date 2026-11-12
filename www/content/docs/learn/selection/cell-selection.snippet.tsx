// Snippets shown on cell-selection.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
} from '@infinite-table/infinite-react';

{
  //#region configuring-the-selection-mode
  <DataSource selectionMode="multi-cell" />

  // can be "single-row", "multi-row", "multi-cell" or false
  //#endregion
}

{
  //#region using-default-selection

  const defaultCellSelection = {
    defaultSelection: false,
    selectedCells: [
      [3, "stack"], // rowId + colId
      [5, "stack"], // rowId + colId
      [0, "firstName"], // rowId + colId
    ]
  }

  <DataSource
    selectionMode="multi-cell"
    defaultCellSelection={defaultCellSelection}
  />
  //#endregion
}

{
  //#region just-a-few-specified-cells-are-selected
  const defaultCellSelection = {
    defaultSelection: false,
    selectedCells: [
      ['id2', 'stack'],
      ['id2', 'stack'],
      ['id0', 'firstName'],
    ],
  };
  //#endregion
}

{
  //#region everything-is-selected-except-a-few-cells
  const defaultCellSelection = {
    defaultSelection: true,
    deselectedCells: [
      ['row2', 'stack'],
      ['row3', 'stack'],
      ['row5', 'firstName'],
    ],
  };
  //#endregion
}

{
  //#region selecting-all-cells-in-a-column
  const defaultCellSelection = {
    defaultSelection: false,
    selectedCells: [
      ['*', 'stack'],
      ['row2', 'firstName'],
    ],
  };
  //#endregion
}

{
  //#region selecting-all-cells-in-a-row
  const defaultCellSelection = {
    defaultSelection: false,
    selectedCells: [
      ['row1', '*'],
      ['row2', 'firstName'],
    ],
  };
  //#endregion
}

{
  //#region selecting-everything-except-a-column
  const defaultCellSelection = {
    defaultSelection: true,
    deselectedCells: [['*', 'stack']],
  };
  //#endregion
}

export {};

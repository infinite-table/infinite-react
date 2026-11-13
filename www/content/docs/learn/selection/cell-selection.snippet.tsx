// Snippets shown on cell-selection.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  DataSource,
  type DataSourcePropCellSelection_MultiCell,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  stack: string;
};

declare const data: Developer[];

export function SelectionMode() {
  //#region configuring-the-selection-mode
  <DataSource primaryKey="id" data={data} selectionMode="multi-cell" />

  // can be "single-row", "multi-row", "multi-cell" or false
  //#endregion
  return null;
}

export function DefaultSelection() {
  //#region using-default-selection

  const defaultCellSelection: DataSourcePropCellSelection_MultiCell = {
    defaultSelection: false,
    selectedCells: [
      [3, "stack"], // rowId + colId
      [5, "stack"], // rowId + colId
      [0, "firstName"], // rowId + colId
    ]
  };

  <DataSource
    primaryKey="id"
    data={data}
    selectionMode="multi-cell"
    defaultCellSelection={defaultCellSelection}
  />
  //#endregion
  return null;
}

// The cell selection formats. Each one is declared as on the page, without a type,
// so they are only checked to be valid objects, not against the library type.
export function someCellsSelected() {
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
  return defaultCellSelection;
}

export function allCellsSelectedExceptSome() {
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
  return defaultCellSelection;
}

export function columnSelected() {
  //#region selecting-all-cells-in-a-column
  const defaultCellSelection = {
    defaultSelection: false,
    selectedCells: [
      ['*', 'stack'],
      ['row2', 'firstName'],
    ],
  };
  //#endregion
  return defaultCellSelection;
}

export function rowSelected() {
  //#region selecting-all-cells-in-a-row
  const defaultCellSelection = {
    defaultSelection: false,
    selectedCells: [
      ['row1', '*'],
      ['row2', 'firstName'],
    ],
  };
  //#endregion
  return defaultCellSelection;
}

export function allCellsSelectedExceptAColumn() {
  //#region selecting-everything-except-a-column
  const defaultCellSelection = {
    defaultSelection: true,
    deselectedCells: [['*', 'stack']],
  };
  //#endregion
  return defaultCellSelection;
}

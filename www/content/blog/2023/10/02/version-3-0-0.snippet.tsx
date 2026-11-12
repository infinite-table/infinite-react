// Snippets shown on version-3-0-0.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
} from '@infinite-table/infinite-react';

{
  //#region configuring-multi-cell-selection
  <DataSource<Developer>
    selectionMode="multi-cell" // <--- THIS
    primaryKey="id"
    data={[...]}
  />
  //#endregion
}

{
  //#region using-a-default-selection
  const defaultCellSelection = {
    defaultSelection: false,
    selectedCells: [
      [3, 'hobby'],
      [4, 'firstName'],
      [4, 'hobby'],
      [4, 'preferredLanguage'],
      [4, 'salary'],
    ],
  };
  //#endregion
}

{
  //#region all-cells-in-row-with-id-rowid3-and-all-cells
  const defaultCellSelection = {
    defaultSelection: false,
    selectedCells: [
      ['*', 'hobby'],
      ['rowId3', '*'],
    ],
  }
  <DataSource selectionMode="multi-cell" defaultCellSelection={defaultCellSelection} />
  //#endregion
}

export {};

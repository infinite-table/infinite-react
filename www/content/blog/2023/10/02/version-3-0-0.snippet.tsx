// Snippets shown on version-3-0-0.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  DataSource,
  type DataSourcePropCellSelection_MultiCell,
  type DataSourceProps,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  hobby: string;
  preferredLanguage: string;
  salary: number;
};

export function MultiCellSelection() {
  return (
    //#region configuring-multi-cell-selection
    <DataSource<Developer>
      selectionMode="multi-cell" // <--- THIS
      primaryKey="id"
      data={[/* ... */]}
    />
    //#endregion
  );
}

export function defaultSelection() {
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
  return defaultCellSelection;
}

// The last snippet shows only the two selection props: the library component with
// every prop optional, so the code stays as it was published.
const AbbreviatedDataSource = DataSource as <T>(
  props: Partial<DataSourceProps<T>>,
) => React.JSX.Element;

export function WildcardSelection() {
  const DataSource = AbbreviatedDataSource;
  //#region all-cells-in-row-with-id-rowid3-and-all-cells
  const defaultCellSelection: DataSourcePropCellSelection_MultiCell = {
    defaultSelection: false,
    selectedCells: [
      ['*', 'hobby'],
      ['rowId3', '*'],
    ],
  };
  <DataSource selectionMode="multi-cell" defaultCellSelection={defaultCellSelection} />
  //#endregion
  return null;
}

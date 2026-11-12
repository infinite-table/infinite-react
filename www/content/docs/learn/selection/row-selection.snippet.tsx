// Snippets shown on row-selection.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
  InfiniteTable,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

{
  //#region configure-the-selection-mode-on-the-datasource
  <DataSource selectionMode="single-row" />

  // can be "single-row", "multi-row", "multi-cell" or false
  //#endregion
}

{
  //#region single-row-selection
  <DataSource<DATA_TYPE>
    primaryKey="id"
    data={[...]}
    defaultRowSelection={4} // #highlight
  >
    <InfiniteTable {...} />
  </DataTable>
  //#endregion
}

{
  //#region choosing-how-users-select-rows
  <DataSource selectionMode="multi-row" {...}>
    <InfiniteTable
      multiRowSelectionWith="click" // #highlight
      columns={columnsWithACheckboxColumn}
    />
  </DataSource>
  //#endregion
}

{
  //#region using-a-selection-checkbox
  const columns: InfiniteTablePropColumns<Developer> = {
    id: {
      field: 'id',
      defaultWidth: 80,
    },
    country: {
      // show the selection checkbox for this column
      renderSelectionCheckBox: true, // #highlight
      field: 'country',
    },
    firstName: {
      field: 'firstName',
    },
  };
  //#endregion
}

{
  //#region selecting-all-rows-when-the-data-is-filtered
  <DataSource<Developer>
    primaryKey="id"
    selectionMode="multi-row"
    multiRowSelectionTarget="visible" // #highlight
    filterFunction={({ data }) => data.preferredLanguage === 'TypeScript'}
  />
  //#endregion
}

{
  //#region specify-a-rowselection-value
  const rowSelection = {
    selectedRows: [3, 6, 100, 23], // those specific rows are selected
    defaultSelection: false, // while all other rows are deselected by default
  };

  // or
  const rowSelection = {
    deselectedRows: [3, 6, 100, 23], // those specific rows are deselected
    defaultSelection: true, // all other rows are selected
  };

  // or, for grouped data - this example assumes groupBy=continent,country,city

  // for using this form of multi-row selection when you have grouping,
  // you have to specify DataSource.useGroupKeysForMultiRowSelection = true
  const rowSelection = {
    selectedRows: [
      45, // row with id 45 is selected, no matter the group it is nested in
      ['Europe', 'France'], // all rows in Europe/France are selected
      ['Asia'], // all rows in Asia are selected
    ],
    deselectedRows: [
      ['Europe', 'France', 'Paris'], // all rows in Paris are deselected
    ],
    defaultSelection: false, // all other rows are selected
  };
  //#endregion
}

{
  //#region specify-a-rowselection-value-2
  // this example assumes groupBy=continent,country,city
  const rowSelection = {
    selectedRows: [
      // row with id 45 is selected - we need this because in the lazyLoad scenario,
      // not all parents might have been made available yet
      ['Europe','Italy', 'Rome', 45], // #highlight
      ['Europe','France'], // all rows in Europe/France are selected
      ['Asia'] // all rows in Asia are selected
    ]
    deselectedRows: [
      ['Europe','Italy','Rome'] // all rows in Rome are deselected
      // but note that row with id 45 is selected, so Rome will be
      // rendered with an indeterminate selection state
    ],
    defaultSelection: false // all other rows are selected
  }
  //#endregion
}

export {};

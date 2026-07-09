import * as React from 'react';

import {
  InfiniteTablePropColumns,
  InfiniteTable,
  DataSource,
  DataSourcePropRowSelection_MultiRow,
  RowSelectionState,
} from '@infinite-table/infinite-react';


import { useState } from 'react';

import { data, height80vhDomProps, type Developer } from './common';

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: {
    field: 'firstName',
    renderSelectionCheckBox: true,
  },
  lastName: {
    field: 'lastName',
  },
  stack: {
    field: 'stack',
  },
  preferredLanguage: {
    field: 'preferredLanguage',
  },
  age: {
    field: 'age',
  },
  canDesign: {
    field: 'canDesign',
  },
  id: { field: 'id' },
};

export default function GroupByExample() {
  const [rowSelection, setRowSelection] =
    useState<DataSourcePropRowSelection_MultiRow>({
      selectedRows: [2, 3],
      defaultSelection: false,
    });

  (globalThis as any).rowSelection = rowSelection;

  return (
    <>
      <div>
        Selected{' '}
        {rowSelection instanceof RowSelectionState
          ? rowSelection.getSelectedCount()
          : false}
      </div>
      <DataSource<Developer>
        primaryKey="id"
        data={data}
        selectionMode="multi-row"
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      >
        <InfiniteTable<Developer>
          domProps={height80vhDomProps}
          columns={columns}
          onCellClick={({ rowIndex, api, dataSourceApi }) => {
            const pk = dataSourceApi.getPrimaryKeyByIndex(rowIndex);
            api.rowSelectionApi.toggleRowSelection(pk);
          }}
          keyboardSelection={true}
          keyboardNavigation={'row'}
          columnDefaultWidth={200}
        />
      </DataSource>
    </>
  );
}

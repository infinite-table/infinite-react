import * as React from 'react';

import {
  InfiniteTablePropColumns,
  InfiniteTable,
  DataSource,
  DataSourcePropRowSelection_MultiRow,
  DataSourceApi,
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
};

export default function GroupByExample() {
  const [rowSelection, setRowSelection] =
    useState<DataSourcePropRowSelection_MultiRow>({
      selectedRows: [2, 3],
      defaultSelection: false,
    });
  const [dataSourceApi, setDataSourceApi] =
    useState<DataSourceApi<Developer> | null>(null);

  (globalThis as any).rowSelection = rowSelection;

  return (
    <>
      <div style={{ color: 'white' }}>
        Selected{' '}
        {rowSelection instanceof RowSelectionState
          ? rowSelection.getSelectedCount()
          : rowSelection.selectedRows?.length}
      </div>
      <DataSource<Developer>
        onReady={setDataSourceApi}
        defaultFilterValue={[]}
        primaryKey="id"
        data={data}
        selectionMode="multi-row"
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onFilterValueChange={() => {
          requestAnimationFrame(() => {
            if (
              !rowSelection.selectedRows ||
              !Array.isArray(rowSelection.selectedRows)
            ) {
              return;
            }
            const selectedRows = rowSelection.selectedRows.filter((rowId) => {
              const row = dataSourceApi!.getRowInfoByPrimaryKey(rowId);
              if (!row) return false;
              return true;
            });

            setRowSelection({
              selectedRows,
              defaultSelection: false,
            });
          });
        }}
      >
        <InfiniteTable<Developer>
          domProps={height80vhDomProps}
          columns={columns}
          keyboardSelection={true}
          keyboardNavigation={'cell'}
          columnDefaultWidth={200}
        />
      </DataSource>
    </>
  );
}

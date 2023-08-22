import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourcePropRowSelection_MultiRow,
  DataSourceApi,
  RowSelectionState,
} from '@infinite-table/infinite-react';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';

import { useState } from 'react';

type Developer = {
  id: number;

  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  age: number;
};

const data: Developer[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Bob',
    age: 20,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 2,
    firstName: 'Marry',
    lastName: 'Bob',
    age: 25,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 3,
    firstName: 'Bill',
    lastName: 'Bobson',
    age: 30,
    canDesign: 'no',
    currency: 'CAD',
    preferredLanguage: 'TypeScript',
    stack: 'frontend',
  },
  {
    id: 4,
    firstName: 'Mark',
    lastName: 'Twain',
    age: 31,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Rust',
    stack: 'backend',
  },
  {
    id: 5,
    firstName: 'Matthew',
    lastName: 'Hilson',
    age: 29,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Go',
    stack: 'backend',
  },
];

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
const domProps = {
  style: {
    height: '80vh',
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
          domProps={domProps}
          columns={columns}
          keyboardSelection={true}
          keyboardNavigation={'cell'}
          columnDefaultWidth={200}
        />
      </DataSource>
    </>
  );
}

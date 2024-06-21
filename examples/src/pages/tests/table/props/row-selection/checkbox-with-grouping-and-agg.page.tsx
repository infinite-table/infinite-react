import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourcePropRowSelection_MultiRow,
  RowSelectionState,
} from '@infinite-table/infinite-react';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';

import { useState } from 'react';

type Developer = {
  id: number;

  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  checkbox: {
    defaultWidth: 140,
    align: 'center',
    resizable: false,

    style: {
      cursor: 'pointer',
    },

    renderSelectionCheckBox: true,
  },
  id: { field: 'id' },

  firstName: {
    field: 'firstName',
    renderSelectionCheckBox: true,
    align: 'end',
  },

  preferredLanguage: {
    field: 'preferredLanguage',
    renderSelectionCheckBox: true,

    defaultWidth: 200,
  },
  stack: { field: 'stack' },
};

const domProps = {
  style: {
    height: '80vh',
  },
};

export default function GroupByExample() {
  const [rowSelection, _setRowSelection] =
    useState<DataSourcePropRowSelection_MultiRow>({
      selectedRows: [2, 3],
      defaultSelection: false,
    });

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
        data={dataSource}
        selectionMode="multi-row"
        defaultGroupBy={[
          {
            field: 'stack',
            column: {
              renderSelectionCheckBox: true,
            },
          },
          {
            field: 'country',
          },
        ]}
        defaultRowSelection={rowSelection}
        onRowSelectionChange={(rowSelection) => {
          console.log(JSON.stringify(rowSelection, null, 2));
        }}
      >
        <InfiniteTable<Developer>
          domProps={domProps}
          groupColumn={{
            field: 'firstName',
            defaultWidth: 200,
          }}
          groupRenderStrategy="single-column"
          columns={columns}
          columnDefaultWidth={100}
        />
      </DataSource>
    </>
  );
}

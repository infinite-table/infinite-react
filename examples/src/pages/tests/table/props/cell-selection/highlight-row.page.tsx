import * as React from 'react';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';

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
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },

  firstName: {
    field: 'firstName',
  },

  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
};

const domProps = {
  style: {
    height: '80vh',
    margin: 10,
  },
};

export default function App() {
  return (
    <>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        selectionMode="multi-cell"
        defaultCellSelection={{
          defaultSelection: false,
          selectedCells: [
            [0, 'firstName'],
            [1, 'firstName'],
            [2, 'stack'],
          ],
        }}
      >
        <InfiniteTable<Developer>
          rowStyle={(params) => {
            return params.rowInfo.hasSelectedCells(params.visibleColumnIds)
              ? {
                  background: 'rgba(255, 0,0, 0.2)',
                }
              : {};
          }}
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

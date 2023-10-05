import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourcePropCellSelection_MultiCell,
  InfiniteTableApi,
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
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers10')
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
  const [_api, setApi] = useState<InfiniteTableApi<Developer> | null>(null);
  const [cellSelection, _setCellSelection] =
    useState<DataSourcePropCellSelection_MultiCell>({
      selectedCells: [
        [2, 'id'],
        [8, 'preferredLanguage'],
        [5, 'stack'],
      ],
      deselectedCells: [[3, 'stack']],
      defaultSelection: false,
    });

  return (
    <>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        selectionMode="multi-cell"
        defaultCellSelection={cellSelection}
      >
        <InfiniteTable<Developer>
          onReady={({ api }) => {
            setApi(api);
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

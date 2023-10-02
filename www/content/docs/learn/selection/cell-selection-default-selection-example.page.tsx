import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
  DataSourcePropCellSelection_MultiCell,
} from '@infinite-table/infinite-react';

import * as React from 'react';

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
  id: { field: 'id', defaultWidth: 60 },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
  country: { field: 'country' },
  age: { field: 'age', type: 'number' },
  salary: { field: 'salary', type: 'number' },
  currency: { field: 'currency', type: 'number' },
};

export default function App() {
  const defaultCellSelection: DataSourcePropCellSelection_MultiCell = {
    defaultSelection: false,
    selectedCells: [
      [3, 'stack'], // rowId + colId
      [4, 'stack'],
      [5, 'stack'],
      [0, 'firstName'],
    ],
  };
  return (
    <DataSource<Developer>
      primaryKey="id"
      data={dataSource}
      defaultCellSelection={defaultCellSelection}
      selectionMode="multi-cell"
    >
      <InfiniteTable<Developer> columns={columns} columnDefaultWidth={100} />
    </DataSource>
  );
}

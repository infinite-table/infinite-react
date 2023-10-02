import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
  DataSourcePropCellSelection_MultiCell,
} from '@infinite-table/infinite-react';

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
  const [cellSelection, setCellSelection] =
    useState<DataSourcePropCellSelection_MultiCell>({
      defaultSelection: false,
      selectedCells: [
        [3, 'stack'],
        [0, 'firstName'],
      ],
    });
  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        color: 'var(--infinite-cell-color)',
        flexFlow: 'column',
        background: 'var(--infinite-background)',
      }}
    >
      <div
        style={{
          maxHeight: 200,
          overflow: 'auto',
          border: '2px solid magenta',
        }}
      >
        Current selection:
        <pre>{JSON.stringify(cellSelection, null, 2)}</pre>
      </div>

      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        cellSelection={cellSelection}
        onCellSelectionChange={setCellSelection}
        selectionMode="multi-cell"
      >
        <InfiniteTable<Developer> columns={columns} columnDefaultWidth={100} />
      </DataSource>
    </div>
  );
}

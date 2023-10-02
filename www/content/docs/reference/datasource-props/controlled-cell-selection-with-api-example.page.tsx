import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
  DataSourcePropCellSelection_MultiCell,
  InfiniteTableApi,
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
  const [cellSelection, setCellSelection] =
    React.useState<DataSourcePropCellSelection_MultiCell>({
      defaultSelection: false,
      selectedCells: [
        [3, 'stack'],
        [0, 'firstName'],
      ],
    });

  const [api, setApi] = React.useState<InfiniteTableApi<Developer> | null>();

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
      <button
        style={{
          margin: 10,
          padding: 10,
          borderRadius: 5,
          border: '2px solid magenta',
        }}
        onClick={() => {
          api?.cellSelectionApi.selectColumn('firstName');
        }}
      >
        Select "firstName" column
      </button>
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
        <InfiniteTable<Developer>
          columns={columns}
          columnDefaultWidth={100}
          onReady={({ api }) => {
            setApi(api);
          }}
        />
      </DataSource>
    </div>
  );
}

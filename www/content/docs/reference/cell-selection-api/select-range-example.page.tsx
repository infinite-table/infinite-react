import {
  InfiniteTable,
  DataSource,
  InfiniteTableApi,
} from '@infinite-table/infinite-react';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';
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
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
  country: { field: 'country' },
  age: { field: 'age', type: 'number' },
  salary: { field: 'salary', type: 'number' },
  currency: { field: 'currency', type: 'number' },
};

export default function App() {
  const [api, setApi] = React.useState<InfiniteTableApi<Developer> | null>(
    null,
  );
  return (
    <>
      <div
        style={{
          color: 'var(--infinite-cell-color)',
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
            api?.cellSelectionApi.clear();
          }}
        >
          Clear
        </button>
        <button
          style={{
            margin: 10,
            padding: 10,
            borderRadius: 5,
            border: '2px solid magenta',
          }}
          onClick={() => {
            api?.cellSelectionApi.selectRange(
              {
                rowId: 1,
                colId: 'id',
              },
              {
                rowIndex: 10,
                colIndex: 3,
              },
            );
          }}
        >
          Select range
        </button>
      </div>

      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        selectionMode="multi-cell"
      >
        <InfiniteTable<Developer>
          onReady={({ api }) => {
            setApi(api);
          }}
          columns={columns}
          columnDefaultWidth={100}
        />
      </DataSource>
    </>
  );
}

import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
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
    .then((data) => {
      return new Promise<Developer[]>((resolve) => {
        // add a delay to make "reloading" more visible
        setTimeout(() => {
          resolve(data);
        }, 1000);
      });
    });
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
  const [refetchKey, setRefetchKey] = React.useState(0);

  return (
    <>
      <button
        style={{
          color: 'var(--infinite-cell-color)',
          margin: 10,
          padding: 20,
          background: 'var(--infinite-background)',
        }}
        onClick={() => {
          setRefetchKey((k) => k + 1);
        }}
      >
        Refetch data
      </button>
      <DataSource<Developer>
        data={dataSource}
        primaryKey="id"
        refetchKey={refetchKey}
      >
        <InfiniteTable<Developer>
          columns={columns}
          columnDefaultWidth={150}
          loadingText={`Refetching with key ${refetchKey}`}
        />
      </DataSource>
    </>
  );
}

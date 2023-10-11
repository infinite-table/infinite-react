import * as React from 'react';

import {
  DataSourceApi,
  InfiniteTable,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

type Developer = {
  id: number;

  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  age: number;
  count?: number;
};

let c = 0;
function count() {
  return c;
}
const getData: () => Developer[] = () => {
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
      count: count(),
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
      count: count(),
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
      count: count(),
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
      count: count(),
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
      count: count(),
    },
  ];

  return data;
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
  },
  age: {
    field: 'age',
    type: 'number',
    defaultEditable: true,
    getValueToPersist: ({ value }) => {
      return !isNaN(Number(value)) ? Number(value) : value;
    },
  },

  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
  count: { field: 'count', minWidth: 150 },
};

const mark: Developer = {
  id: 6,
  firstName: 'Mark',
  lastName: 'Berg',
  age: 39,
  canDesign: 'no',
  currency: 'USD',
  preferredLanguage: 'Go',
  stack: 'frontend',
  count: count(),
};

const beforeMark: Developer = {
  id: 7,
  firstName: 'Before Mark',
  lastName: 'Before',
  age: 39,
  canDesign: 'no',
  currency: 'USD',
  preferredLanguage: 'Go',
  stack: 'frontend',
  count: count(),
};

(globalThis as any).mutations = undefined;
(globalThis as any).onDataMutationsCalls = 0;

export default () => {
  const [data, setData] = React.useState<Developer[]>(() => getData());
  const [dataSourceApi, setDataSourceApi] =
    React.useState<DataSourceApi<Developer>>();
  return (
    <>
      <button
        onClick={() => {
          dataSourceApi!.addData(mark);
          dataSourceApi!.insertData(beforeMark, {
            position: 'before',
            primaryKey: 6,
          });
        }}
      >
        Add 2 items
      </button>

      <button
        onClick={() => {
          dataSourceApi!.updateData({
            id: 2,
            age: 100,
          });
        }}
      >
        Update id=2 to age=100
      </button>
      <button
        onClick={() => {
          c++;
          setData(() => getData());
        }}
      >
        Refresh data
      </button>

      <React.StrictMode>
        <DataSource<Developer>
          data={data}
          primaryKey="id"
          onReady={setDataSourceApi}
          onDataMutations={({ mutations }) => {
            (globalThis as any).mutations = mutations;
            (globalThis as any).onDataMutationsCalls++;
          }}
        >
          <InfiniteTable<Developer>
            domProps={{
              style: {
                height: '100%',
              },
            }}
            columnSizing={{
              id: {
                width: 500,
              },
            }}
            columnDefaultWidth={100}
            columnMinWidth={50}
            columns={columns}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};

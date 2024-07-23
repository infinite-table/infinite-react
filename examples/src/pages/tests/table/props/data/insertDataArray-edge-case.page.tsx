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
};

const data: Developer[] = [];

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
  },

  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
};

(globalThis as any).mutations = undefined;

export default () => {
  const [dataSourceApi, setDataSourceApi] =
    React.useState<DataSourceApi<Developer>>();
  return (
    <>
      <button
        onClick={() => {
          dataSourceApi!
            .insertDataArray(
              [
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
                  firstName: 'Hapson',
                  lastName: 'Twain',
                  age: 31,
                  canDesign: 'yes',
                  currency: 'CAD',
                  preferredLanguage: 'Rust',
                  stack: 'backend',
                },
              ],
              {
                position: 'end',
              },
            )
            .then(() => {
              console.log(dataSourceApi?.getRowInfoArray());
            });
        }}
      >
        Insert item
      </button>

      <React.StrictMode>
        <DataSource<Developer>
          data={data}
          primaryKey="id"
          onReady={setDataSourceApi}
        >
          <InfiniteTable<Developer>
            domProps={{
              style: {
                height: '100%',
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

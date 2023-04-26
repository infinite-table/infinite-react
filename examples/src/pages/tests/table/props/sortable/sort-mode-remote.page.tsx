import * as React from 'react';

import {
  DataSourceDataParams,
  InfiniteTable,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';
import { useState } from 'react';

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
  },
];

const columns: InfiniteTablePropColumns<Developer> = {
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

//@ts-ignore
globalThis.dataSourceCalls = 0;
export default () => {
  const [refetchKey, setRefetchKey] = useState(1);

  const dataSource = React.useCallback(
    ({ refetchKey }: DataSourceDataParams<Developer>) => {
      //@ts-ignore
      globalThis.dataSourceCalls += 1;
      console.log('refetchKey', refetchKey);
      return Promise.resolve(
        refetchKey && (refetchKey as number) % 2 === 0
          ? data.slice(0, 2)
          : data.slice(0, data.length),
      );
    },
    [],
  );
  return (
    <>
      <React.StrictMode>
        <button onClick={() => setRefetchKey((k) => k + 1)}>refetch</button>
        <DataSource<Developer>
          refetchKey={refetchKey}
          data={dataSource}
          primaryKey="id"
          sortMode="remote"
        >
          <InfiniteTable<Developer>
            columns={columns}
            domProps={{
              style: {
                minHeight: 500,
              },
            }}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};

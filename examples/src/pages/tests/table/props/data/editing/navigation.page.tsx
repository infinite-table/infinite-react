import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTableApi,
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
  salary: string;

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
    salary: '$ 1000',
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
    salary: '$ 11000',
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
    salary: '$ 12000',
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
    salary: '£ 21000',
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
    salary: '£ 9000',
  },
];

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    renderValue: ({ value }) => <input value={value} />,
    contentFocusable: true,
  },
  firstName: {
    field: 'firstName',
    renderValue: ({ value }) => <input value={value} />,
    contentFocusable: true,
  },
  age: {
    field: 'age',
    type: 'number',

    defaultEditable: true,
  },
  salary: {
    field: 'salary',
    defaultEditable: true,
    style: ({ editError }) => {
      return {
        background: editError ? 'tomato' : '',
      };
    },
    getValueToEdit: ({ value }) => value.substr(1).trim(),
    getValueToPersist: ({ value, initialValue }) => {
      return `${initialValue[0]} ${value}`;
    },
  },

  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
};

export default () => {
  const [api, setApi] = React.useState<InfiniteTableApi<Developer> | null>(
    null,
  );
  const onReady = React.useCallback(
    ({ api }: { api: InfiniteTableApi<Developer> }) => {
      setApi(api);
    },
    [],
  );
  return (
    <>
      <React.StrictMode>
        <input />
        <button
          onClick={() => {
            setTimeout(() => {
              api?.focus();
            }, 150);
          }}
        >
          Focus
        </button>
        <DataSource<Developer> data={data} primaryKey="id">
          <InfiniteTable<Developer>
            domProps={{
              style: {
                height: '100%',
              },
            }}
            onReady={onReady}
            columnDefaultWidth={150}
            shouldAcceptEdit={({ value, column }) => {
              if (column.field !== 'salary') {
                return true;
              }
              console.log(parseInt(value));
              if (parseInt(value) < 0) {
                return false;
              }
              return new Promise((resolve, reject) => {
                setTimeout(() => {
                  resolve(true);
                }, 500);
              });
            }}
            persistEdit={({ value, data, dataSourceApi }) => {
              return new Promise((resolve, reject) => {
                setTimeout(() => {
                  resolve(dataSourceApi.updateData({ ...data, salary: value }));
                }, 1000);
              });
            }}
            onEditPersistError={({ error }) => {
              // console.log('err', error);
            }}
            onEditPersistSuccess={() => {
              // console.info('success');
            }}
            columnMinWidth={50}
            columns={columns}
          />
        </DataSource>
        <input />
      </React.StrictMode>
    </>
  );
};

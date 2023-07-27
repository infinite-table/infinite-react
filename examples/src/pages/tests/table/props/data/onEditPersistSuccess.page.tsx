import * as React from 'react';

import {
  DataSourceApi,
  InfiniteTable,
  InfiniteTablePropColumns,
  InfiniteTableProps,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

const sinon = require('sinon');

type NonUndefined<T> = T extends undefined ? never : T;

const onEditPersistSuccess = sinon.spy(
  (
    _params: Parameters<
      NonUndefined<InfiniteTableProps<any>['onEditPersistSuccess']>
    >[0],
  ) => {},
);

(globalThis as any).onEditPersistSuccess = onEditPersistSuccess;

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
  id: {
    field: 'id',
    // defaultWidth: 500,
    // defaultFlex: 2
    // defaultEditable: ({ column, value, data, }) => {
    //   return Promise.resolve(true)
    // }
    // defaultEditable: false,
  },
  firstName: {
    field: 'firstName',
  },
  age: {
    field: 'age',
    type: 'number',
    defaultEditable: true,
    getValueToPersist: ({ value }) => {
      const result = !isNaN(Number(value)) ? Number(value) * 10 : value;

      return result;
    },
  },

  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
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
};

(globalThis as any).mutations = undefined;

export default () => {
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
            columnSizing={{
              id: {
                width: 500,
              },
            }}
            onEditPersistSuccess={onEditPersistSuccess}
            // editable={true}
            // columnEditable={() => {

            // }}

            // persistEdit={({ value, column, rowInfo, api, dataSourceApi}) => {
            //   return fetch(...)
            // }}
            // onEditPersistSuccess={({ value, data, column, dataSourceApi}) => {
            //   dataSourceApi?.updateData({data, [column.field]: value})
            // }}
            // onEditPersistError

            columnDefaultWidth={100}
            columnMinWidth={50}
            columns={columns}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};

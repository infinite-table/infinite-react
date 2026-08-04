import * as React from 'react';

import {
  DataSourceApi,
  InfiniteTable,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

import {
  type Developer as BaseDeveloper,
  developersData5,
  mark as baseMark,
  height100DomProps,
} from './common';

type Developer = BaseDeveloper & { count?: number };

let c = 0;
function count() {
  return c;
}
const getData: () => Developer[] = () =>
  developersData5.map((row) => ({ ...row, count: count() }));

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

const mark: Developer = { ...baseMark, count: count() };

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
          onDataArrayChange={(dataArray, info) => {
            console.log({
              dataArray,
              info,
            });
          }}
          onDataMutations={({ mutations }) => {
            console.log(mutations);
            (globalThis as any).mutations = mutations;
            (globalThis as any).onDataMutationsCalls++;
          }}
        >
          <InfiniteTable<Developer>
            domProps={height100DomProps}
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

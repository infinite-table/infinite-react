import * as React from 'react';

import {
  DataSourceData,
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

  salary: number;
};

const data: DataSourceData<Developer> = ({ filterValue }) => {
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL +
      `/developers1k-sql?filterBy=${JSON.stringify(
        filterValue?.map((x) => {
          x.filterType = 'number';
          //@ts-ignore
          x.value = Number(x.filterValue);
          return x;
        }),
      )}`,
  )
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
  },
  salary: {
    defaultFilterable: true,
    field: 'salary',
    type: 'number',
    filterType: 'salary',
  },
  stack: { field: 'stack' },
  currency: { field: 'currency', defaultFilterable: false },
};

export default () => {
  return (
    <>
      <React.StrictMode>
        <DataSource<Developer>
          data={data}
          primaryKey="id"
          defaultFilterValue={[]}
          filterDelay={0}
          filterMode="local"
          filterTypes={{
            salary: {
              defaultOperator: 'gt',
              emptyValues: new Set(['', null, undefined]),
              operators: [
                {
                  name: 'gt',
                  label: 'Greater Than',
                  components: {
                    Icon: () => <>{'>'}</>,
                  },
                  fn: ({ currentValue, filterValue, emptyValues }) => {
                    if (
                      emptyValues.has(currentValue) ||
                      emptyValues.has(filterValue)
                    ) {
                      return true;
                    }
                    return currentValue > filterValue;
                  },
                },
                {
                  name: 'gte',
                  components: {
                    Icon: () => <>{'>='}</>,
                  },
                  label: 'Greater Than or Equal',
                  fn: ({ currentValue, filterValue, emptyValues }) => {
                    if (
                      emptyValues.has(currentValue) ||
                      emptyValues.has(filterValue)
                    ) {
                      return true;
                    }
                    return currentValue >= filterValue;
                  },
                },
                {
                  name: 'lt',
                  components: {
                    Icon: () => <>{'<'}</>,
                  },
                  label: 'Less Than',
                  fn: ({ currentValue, filterValue, emptyValues }) => {
                    if (
                      emptyValues.has(currentValue) ||
                      emptyValues.has(filterValue)
                    ) {
                      return true;
                    }
                    return currentValue < filterValue;
                  },
                },
                {
                  name: 'lte',
                  components: {
                    Icon: () => <>{'<='}</>,
                  },
                  label: 'Less Than or Equal',
                  fn: ({ currentValue, filterValue, emptyValues }) => {
                    if (
                      emptyValues.has(currentValue) ||
                      emptyValues.has(filterValue)
                    ) {
                      return true;
                    }
                    return currentValue <= filterValue;
                  },
                },
              ],
            },
          }}
        >
          <InfiniteTable<Developer>
            domProps={{
              style: {
                height: '100%',
              },
            }}
            columnDefaultWidth={150}
            columnMinWidth={50}
            columns={columns}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};

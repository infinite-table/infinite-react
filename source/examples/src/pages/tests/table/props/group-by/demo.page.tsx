import * as React from 'react';

import fetch from 'isomorphic-fetch';

import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
  DataSourceGroupBy,
  InfiniteTablePropGroupRenderStrategy,
  InfiniteTableColumnAggregator,
  DataSourcePropAggregationReducers,
  InfiniteTableGroupColumnBase,
} from '@infinite-table/infinite-react';

import { useState } from 'react';

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
  // return Promise.resolve(employees);
  return fetch(`${process.env.NEXT_PUBLIC_BASE_URL!}/developers1k-sql`)
    .then((r) => r.json())
    .then((data: Developer[]) => {
      return data;
    });
};

const columns = new Map<string, InfiniteTableColumn<Developer>>([
  [
    'identifier',
    {
      field: 'id',
      // render: ({ value, rowInfo }) => {
      //   if (rowInfo.isGroupRow) {
      //     return rowInfo.reducerResults.salary;
      //   }

      //   return value;
      // },
    },
  ],
  [
    'name',
    {
      field: 'firstName',
      name: 'First Name',
    },
  ],
  ['city', { field: 'city' }],
  [
    'fullName',
    {
      name: 'Full name',
      render: ({ data }) => {
        return (
          <>
            {data?.firstName} - {data?.lastName}
          </>
        );
      },
    },
  ],
  [
    'age',
    {
      field: 'age',
      type: 'number',
    },
  ],
  [
    'country',
    {
      field: 'country',
    },
  ],
]);

const domProps = {
  style: { height: '80vh' },
};

const groupBy: DataSourceGroupBy<Developer>[] = [
  {
    field: 'country',
  },
  {
    field: 'city',
  },
  {
    field: 'stack',
  },
];

const defaultColumnSizing = {
  // 'group-by-department': {
  //   width: 250,
  // },
};

export default function GroupByExample() {
  const [strategy, setStrategy] =
    useState<InfiniteTablePropGroupRenderStrategy>('multi-column');

  const groupColumn = React.useMemo<
    InfiniteTableGroupColumnBase<Developer>
  >(() => {
    return {
      renderValue: (arg) => {
        const { value } = arg;

        return value ? <b>{value}📢</b> : null;
      },
    };
  }, []);

  const avgReducer: InfiniteTableColumnAggregator<Developer, any> = {
    initialValue: 0,
    reducer: (acc, sum) => acc + sum,
    done: (sum, arr) => (arr.length ? sum / arr.length : 0),
  };
  const aggregationReducers: DataSourcePropAggregationReducers<Developer> = {
    salary: { field: 'salary', ...avgReducer },
    age: { field: 'age', ...avgReducer },
  };
  return (
    <>
      <select
        title="strategy"
        value={strategy}
        onChange={(e: any) => {
          const { value } = e.target;
          setStrategy(value);
        }}
      >
        <option value="single-column">Single column</option>
        <option value="multi-column">Multi column</option>
        <option value="inline">Inline</option>
      </select>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        groupBy={groupBy}
        aggregationReducers={aggregationReducers}
      >
        <InfiniteTable<Developer>
          domProps={domProps}
          columns={columns}
          columnDefaultWidth={200}
          groupColumn={groupColumn}
          groupRenderStrategy={strategy}
          defaultColumnSizing={defaultColumnSizing}
        ></InfiniteTable>
      </DataSource>
    </>
  );
}

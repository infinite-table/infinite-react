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
} from '@infinite-table/infinite-react';

import { useState } from 'react';

type Employee = {
  id: number;
  companyName: string;
  companySize: string;
  firstName: string;
  lastName: string;
  country: string;
  countryCode: string;
  city: string;
  streetName: string;
  streetNo: number;
  department: string;
  team: string;
  salary: number;
  age: number;
  email: string;
};

const dataSource = () => {
  // return Promise.resolve(employees);
  return fetch(`${process.env.NEXT_PUBLIC_DATAURL!}/employees`)
    .then((r) => r.json())
    .then((data: Employee[]) => {
      return data;
    });
};

const columns = new Map<string, InfiniteTableColumn<Employee>>([
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
  ['deparment', { field: 'department' }],
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

const groupBy: DataSourceGroupBy<Employee>[] = [
  {
    field: 'department',
  },
  {
    field: 'team',
  },
  {
    field: 'country',
  },
];

const defaultColumnSizing = {
  'group-by-department': {
    width: 250,
  },
};

export default function GroupByExample() {
  const [strategy, setStrategy] =
    useState<InfiniteTablePropGroupRenderStrategy>('multi-column');

  const groupColumn = React.useMemo(() => {
    return {
      renderValue: ({ value }: { value: any }) => {
        return value ? <b>{value}📢</b> : null;
      },
    };
  }, []);

  const avgReducer: InfiniteTableColumnAggregator<Employee, any> = {
    initialValue: 0,
    reducer: (acc, sum) => acc + sum,
    done: (sum, arr) => (arr.length ? sum / arr.length : 0),
  };
  const aggregationReducers: DataSourcePropAggregationReducers<Employee> = {
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
      <DataSource<Employee>
        primaryKey="id"
        data={dataSource}
        groupBy={groupBy}
        aggregationReducers={aggregationReducers}
      >
        <InfiniteTable<Employee>
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

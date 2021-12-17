import * as React from 'react';

import fetch from 'isomorphic-fetch';

import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
  DataSourceGroupRowsBy,
  InfiniteTablePropGroupRenderStrategy,
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

const groupRowsBy: DataSourceGroupRowsBy<Employee>[] = [
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
        groupRowsBy={groupRowsBy}
      >
        <InfiniteTable<Employee>
          domProps={domProps}
          columns={columns}
          columnDefaultWidth={200}
          groupColumn={groupColumn}
          groupRenderStrategy={strategy}
        ></InfiniteTable>
      </DataSource>
    </>
  );
}

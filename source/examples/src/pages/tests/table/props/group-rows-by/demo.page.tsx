import * as React from 'react';

import fetch from 'isomorphic-fetch';

import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
  DataSourceGroupRowsBy,
} from '@infinite-table/infinite-react';

import {
  InfiniteTablePropGroupRenderStrategy,
  InfiniteTablePropRowStyle,
} from '@src/components/InfiniteTable/types/InfiniteTableProps';
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
      width: 300,
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
  // {
  //   field: 'department',
  // },
  {
    field: 'team',
  },
  // {
  //   field: 'country',
  // },
];

const rowStyle: InfiniteTablePropRowStyle<Employee> = ({
  data,
  enhancedData,
}) => {
  // const age = data?.age ?? 0;

  // if (enhancedData.isGroupRow) {
  //   const result = {
  //     background: (enhancedData.groupNesting ?? 0) > 2 ? 'green' : 'yellow',
  //     testxxx: true,
  //   };

  //   return result;
  // }

  // return age > 30
  //   ? {
  //       background: 'tomato',
  //     }
  //   : {};
  return {};
};
export default function GroupByExample() {
  const [strategy, setStrategy] =
    useState<InfiniteTablePropGroupRenderStrategy>('multi-column');

  return (
    <>
      <select
        value={strategy}
        onChange={(e: any) => {
          const { value } = e.target;
          setStrategy(value);
        }}
      >
        <option value="single-column">Single column</option>
        <option value="multi-column">Multi column</option>
      </select>
      <DataSource<Employee>
        primaryKey="id"
        data={dataSource}
        groupRowsBy={groupRowsBy}
      >
        <InfiniteTable<Employee>
          domProps={domProps}
          columns={columns}
          columnOrder={['identifier', 'name', 'group-by-team', 'deparment']}
          columnDefaultWidth={200}
          rowStyle={rowStyle}
          groupColumn={{
            renderValue: ({ value }) => {
              return value ? <b>{value}📢</b> : null;
            },
          }}
          groupRenderStrategy={strategy}
        ></InfiniteTable>
      </DataSource>
    </>
  );
}

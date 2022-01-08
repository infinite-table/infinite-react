import * as React from 'react';

import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
  GroupRowsState,
  DataSourceGroupBy,
} from '@infinite-table/infinite-react';

import { employees } from './employees10';
import { useMemo, useState } from 'react';

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
  return Promise.resolve(employees);
  // return fetch(`${process.env.NEXT_PUBLIC_DATAURL!}/employees10`)
  // .then((r) => r.json())
  // .then((data: Employee[]) => {
  //   return data;
  // });
};

const columns = new Map<string, InfiniteTableColumn<Employee>>([
  [
    'firstName',
    {
      field: 'firstName',
      header: 'First Name',
    },
  ],

  [
    'country',
    {
      field: 'country',
      header: 'Country',
    },
  ],

  [
    'department',
    {
      field: 'department',
      header: 'Department',
    },
  ],
]);

const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

const domProps: React.HTMLProps<HTMLDivElement> = {
  style: {
    margin: '5px',
    height: 900,
    border: '1px solid gray',
    position: 'relative',
  },
};

export default function GroupByExample() {
  const [customGroupColumnId, setCustomGroupColumnId] = useState(false);

  const groupBy = useMemo<DataSourceGroupBy<Employee>[]>(
    () => [
      {
        field: 'department',
      },
      {
        field: 'country',
        column: customGroupColumnId
          ? { id: 'custom-country', header: 'custom-country' }
          : undefined,
      },
    ],
    [customGroupColumnId],
  );
  return (
    <React.StrictMode>
      <button
        onClick={() => {
          setCustomGroupColumnId((value) => !value);
        }}
      >
        use custom group column id id
      </button>
      <DataSource<Employee>
        data={dataSource}
        primaryKey="id"
        groupBy={groupBy}
        defaultGroupRowsState={groupRowsState}
      >
        <InfiniteTable<Employee>
          domProps={domProps}
          hideEmptyGroupColumns
          columnDefaultWidth={200}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
}

import * as React from 'react';

import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
  DataSourceGroupBy,
} from '@infinite-table/infinite-react';

import { employees } from './employees10';
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
  return Promise.resolve(employees);
};

const columns: Record<string, InfiniteTableColumn<Employee>> = {
  firstNameID: {
    field: 'firstName',
    header: 'First Name',
  },

  countryID: {
    field: 'country',
  },

  cityID: {
    field: 'city',
  },

  streetNameID: {
    field: 'streetName',
  },
  streetNoID: {
    field: 'streetNo',
  },
  ageID: {
    field: 'age',
    type: 'number',
  },
  departmentID: {
    field: 'department',
    defaultHiddenWhenGroupedBy: 'department',
  },
  salaryID: {
    field: 'salary',
    type: 'number',
    defaultHiddenWhenGroupedBy: { salary: true, team: true },
  },
  teamID: {
    field: 'team',
    defaultHiddenWhenGroupedBy: '*',
  },

  companyID: { field: 'companyName' },
  companySizeID: { field: 'companySize' },
};

export default function GroupByExample() {
  const [groupBy, setGroupBy] = useState<DataSourceGroupBy<Employee>[]>(() => [
    {
      field: 'country',
    },
    { field: 'city' },
    { field: 'department' },
    { field: 'team' },
    { field: 'companySize' },
  ]);
  //@ts-ignore
  globalThis.setGroupBy = setGroupBy;
  return (
    <React.StrictMode>
      <DataSource<Employee> data={dataSource} primaryKey="id" groupBy={groupBy}>
        <InfiniteTable<Employee>
          domProps={{
            style: {
              margin: '5px',
              height: 900,
              minWidth: 10_000,
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          groupColumn={({ groupByForColumn }) => {
            return {
              defaultWidth: 200,
              header: `Group by ${groupByForColumn?.field}`,
            };
          }}
          columnDefaultWidth={100}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
}

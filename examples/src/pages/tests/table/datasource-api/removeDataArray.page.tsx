import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropRowStyle,
  InfiniteTableRowInfo,
  DataSourceApi,
  type InfiniteTableColumn,
} from '@infinite-table/infinite-react';
import React, { useState } from 'react';

export type Employee = {
  id: number;
  companyName: string;
  companySize: string;
  firstName: string;
  lastName: string;
  country: string;
  countryCode: string;
  city: string;
  streetName: string;
  streetNo: string;
  department: string;
  team: string;
  salary: number;
  age: number;
  email: string;
};

const data: Employee[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    country: 'USA',
    city: 'New York',
    salary: 100000,
    department: 'Engineering',
    team: 'Team A',
    companyName: 'Company A',
    companySize: 'Large',
    countryCode: 'US',
    streetName: 'Main St',
    streetNo: '123',
    age: 30,
    email: 'john.doe@example.com',
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    country: 'Canada',
    city: 'Toronto',
    salary: 90000,
    department: 'Marketing',
    team: 'Team B',
    companyName: 'Company B',
    companySize: 'Medium',
    countryCode: 'CA',
    streetName: 'Maple Ave',
    streetNo: '456',
    age: 28,
    email: 'jane.smith@example.com',
  },
  {
    id: 3,
    firstName: 'Alice',
    lastName: 'Johnson',
    country: 'UK',
    city: 'London',
    salary: 120000,
    department: 'Finance',
    team: 'Team C',
    companyName: 'Company C',
    companySize: 'Small',
    countryCode: 'UK',
    streetName: 'Baker St',
    streetNo: '789',
    age: 35,
    email: 'alice.johnson@example.com',
  },
  {
    id: 4,
    firstName: 'Bob',
    lastName: 'Brown',
    country: 'Australia',
    city: 'Sydney',
    salary: 110000,
    department: 'Human Resources',
    team: 'Team D',
    companyName: 'Company D',
    companySize: 'Medium',
    countryCode: 'AU',
    streetName: 'Collins St',
    streetNo: '101',
    age: 40,
    email: 'bob.brown@example.com',
  },
];

export const columns: Record<string, InfiniteTableColumn<Employee>> = {
  firstName: {
    field: 'firstName',
    header: 'First Name',
  },
  country: {
    field: 'country',
    header: 'Country',
    columnGroup: 'location',
  },
  city: {
    field: 'city',
    header: 'City',
    columnGroup: 'address',
  },
  salary: {
    field: 'salary',
    type: 'number',
    header: 'Salary',
  },
  department: {
    field: 'department',
    header: 'Department',
  },
  team: {
    field: 'team',
    header: 'Team',
  },
  company: { field: 'companyName', header: 'Company' },
  companySize: { field: 'companySize', header: 'Company Size' },
};

const rowStyle: InfiniteTablePropRowStyle<Employee> = (param: {
  rowInfo: InfiniteTableRowInfo<Employee>;
}) => {
  const { rowInfo } = param;
  if (rowInfo.isGroupRow) {
    return;
  }
  const { data } = rowInfo;
  const salary = data ? data.salary : 0;

  if (salary > 150_000) {
    return { background: 'tomato' };
  }

  if (rowInfo.indexInAll % 10 === 0) {
    return { background: 'lightblue', color: 'black' };
  }
  return undefined;
};

export default function App() {
  const [dataSourceApi, setDataSourceApi] =
    useState<DataSourceApi<Employee> | null>(null);

  const removeRowsByPrimaryKey = async () => {
    if (!dataSourceApi) {
      return;
    }
    const getAllData = dataSourceApi.getRowInfoArray();
    console.log('data source before remove', getAllData);

    const listOfPrimaryKeys = getAllData.map((row: any) => row.data.id);
    console.log('listOfPrimaryKeys', listOfPrimaryKeys);

    await dataSourceApi.removeDataArrayByPrimaryKeys(listOfPrimaryKeys);
    console.log('data source after remove', dataSourceApi.getRowInfoArray());
  };

  const removeRowsByDataRow = async () => {
    if (!dataSourceApi) {
      return;
    }
    const getAllData = dataSourceApi.getRowInfoArray();
    console.log('data source before remove', getAllData);

    const listOfRows = getAllData.map((row: any) => row.data);
    console.log('listOfRows', listOfRows);
    await dataSourceApi.removeDataArray(listOfRows);
    console.log('data source after remove', dataSourceApi.getRowInfoArray());
  };

  return (
    <>
      <button type="button" onClick={removeRowsByPrimaryKey}>
        Click Me to removeRowsByPrimaryKey!
      </button>
      <button type="button" onClick={removeRowsByDataRow}>
        Click Me to removeRowsByDataRow!
      </button>
      <DataSource<Employee>
        onReady={setDataSourceApi}
        data={data}
        primaryKey="id"
      >
        <InfiniteTable<Employee>
          columns={columns}
          rowStyle={rowStyle}
          domProps={{
            style: { height: '80vh' },
          }}
        />
      </DataSource>
    </>
  );
}

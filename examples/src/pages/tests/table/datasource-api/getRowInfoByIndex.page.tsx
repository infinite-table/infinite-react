import {
  InfiniteTable,
  DataSource,
  type InfiniteTableColumn,
} from '@infinite-table/infinite-react';
import * as React from 'react';

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

export default function App() {
  return (
    <>
      <DataSource<Employee> data={data} primaryKey="id">
        <InfiniteTable<Employee>
          columns={columns}
          domProps={{
            style: { height: '80vh' },
          }}
        />
      </DataSource>
    </>
  );
}

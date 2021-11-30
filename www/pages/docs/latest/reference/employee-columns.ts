import { InfiniteTableColumn } from '@infinite-table/infinite-react';

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

export const columns = new Map<
  string,
  InfiniteTableColumn<Employee>
>([
  [
    'firstName',
    {
      field: 'firstName',
      header: 'First Name',
    },
  ],
  ['company', { field: 'companyName', header: 'Company' }],
  [
    'country',
    {
      field: 'country',
      header: 'Country',
      columnGroup: 'location',
    },
  ],

  [
    'city',
    {
      field: 'city',
      header: 'City',
      columnGroup: 'address',
    },
  ],
  [
    'salary',
    {
      field: 'salary',
      type: 'number',
      header: 'Salary',
    },
  ],
  [
    'department',
    {
      field: 'department',
      header: 'Department',
    },
  ],
  [
    'team',
    {
      width: 200,
      field: 'team',
      header: 'Team',
    },
  ],

  [
    'companySize',
    { field: 'companySize', header: 'Company Size' },
  ],
]);

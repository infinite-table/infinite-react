import * as React from 'react';
import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import { useState } from 'react';

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

export const columns: InfiniteTablePropColumns<Employee> = {
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

  companySize: {
    field: 'companySize',
    header: 'Company Size',
  },
};

export default function App() {
  const [columnOrder, setColumnOrder] = useState<
    string[] | true
  >([
    'firstName',
    'country',
    'team',
    'company',
    'firstName',
    'not existing column',
    'companySize',
  ]);

  return (
    <>
      <div style={{ color: 'var(--infinite-cell-color)' }}>
        <p>
          Current column order:{' '}
          <code>
            <pre>{JSON.stringify(columnOrder)}.</pre>
          </code>
        </p>
        <p>
          Note: if the column order contains columns that
          don't exist in the `columns` definition, they will
          be skipped.
        </p>

        <button
          style={{
            border: '2px solid currentColor',
            padding: 5,
          }}
          onClick={() => {
            setColumnOrder(['firstName', 'country']);
          }}>
          Click to only show "firstName" and "country".
        </button>

        <button
          style={{
            border: '2px solid currentColor',
            padding: 5,
            marginLeft: 5,
          }}
          onClick={() => {
            setColumnOrder(true);
          }}>
          Click to reset column order.
        </button>
      </div>

      <DataSource<Employee>
        data={dataSource}
        primaryKey="id">
        <InfiniteTable<Employee>
          columns={columns}
          columnOrder={columnOrder}
          onColumnOrderChange={setColumnOrder}
          columnDefaultWidth={200}
        />
      </DataSource>
    </>
  );
}

const dataSource = () => {
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL + '/employees100'
  )
    .then((r) => r.json())
    .then((data: Employee[]) => data);
};

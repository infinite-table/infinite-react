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
  const [columnOrder, setColumnOrder] = useState<string[]>([
    'firstName',
    'country',
    'team',
    'company',
    'department',
    'companySize',
  ]);

  return (
    <>
      <div style={{ color: 'var(--infinite-cell-color)' }}>
        <p>
          Current column order:{' '}
          <code>
            <pre>{columnOrder.join(', ')}.</pre>
          </code>
        </p>
        <p>Drag column headers to reorder.</p>
      </div>

      <DataSource<Employee> data={dataSource} primaryKey="id">
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
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees100')
    .then((r) => r.json())
    .then((data: Employee[]) => data);
};

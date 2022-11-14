import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react@prerelease';
import * as React from 'react';
import { useState } from 'react';

export const columns: Record<string, InfiniteTableColumn<Employee>> = {
  firstName: {
    field: 'firstName',
    header: 'First Name',
  },
  country: {
    field: 'country',
    header: 'Country',
  },
  city: {
    field: 'city',
    header: 'City',
  },
  salary: {
    field: 'salary',
    type: 'number',
    header: 'Salary',
  },
};

export default function App() {
  const [resizableColumns, setResizableColumns] = useState(true);
  return (
    <>
      <div style={{ color: 'var(--infinite-cell-color)' }}>
        <button
          style={{
            padding: 10,
            border: '2px solid currentColor',
          }}
          onClick={() => setResizableColumns((r) => !r)}
        >
          Click to toggle
        </button>

        <p style={{ padding: 10 }}>
          Columns are currently{' '}
          {resizableColumns ? 'resizable' : 'NOT RESIZABLE'}.
        </p>
      </div>
      <DataSource<Employee> data={dataSource} primaryKey="id">
        <InfiniteTable<Employee>
          resizableColumns={resizableColumns}
          columns={columns}
          columnDefaultWidth={100}
          columnMinWidth={30}
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

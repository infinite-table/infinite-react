import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumnSizing,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import * as React from 'react';
import { useState } from 'react';

export const columns: InfiniteTablePropColumns<Employee> = {
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

const columnSizing: InfiniteTablePropColumnSizing = {
  country: { width: 100 },
  city: { flex: 1, minWidth: 100 },
  salary: { flex: 2, maxWidth: 500 },
};

export default function App() {
  const [columnSizing, setColumnSizing] =
    React.useState<InfiniteTablePropColumnSizing>({
      country: { width: 100 },
      city: { flex: 1, minWidth: 100 },
      salary: { flex: 2, maxWidth: 500 },
    });

  const [viewportReservedWidth, setViewportReservedWidth] = useState(0);

  return (
    <>
      <p style={{ color: 'var(--infinite-cell-color)' }}>
        Current column sizing:{' '}
        <code>
          <pre>{JSON.stringify(columnSizing, null, 2)}</pre>
        </code>
        Viewport reserved width: {viewportReservedWidth} -{' '}
        <button onClick={() => setViewportReservedWidth(0)}>
          click to reset to 0
        </button>
      </p>
      <DataSource<Employee> data={dataSource} primaryKey="id">
        <InfiniteTable<Employee>
          columns={columns}
          columnDefaultWidth={50}
          columnSizing={columnSizing}
          onColumnSizingChange={setColumnSizing}
          viewportReservedWidth={viewportReservedWidth}
          onViewportReservedWidthChange={setViewportReservedWidth}
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

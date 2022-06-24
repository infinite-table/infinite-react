import * as React from 'react';
import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumnSizing,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';
import { useState } from 'react';

export const columns: Record<
  string,
  InfiniteTableColumn<Employee>
> = {
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

const defaultColumnSizing: InfiniteTablePropColumnSizing = {
  country: { flex: 1 },
  city: { flex: 1 },
  salary: { flex: 2 },
};

export default function App() {
  const [viewportReservedWidth, setViewportReservedWidth] =
    useState(0);
  return (
    <>
      <div style={{ color: 'var(--infinite-cell-color' }}>
        <p>
          Current viewport reserved width:{' '}
          {viewportReservedWidth}px.
        </p>

        <button
          style={{
            padding: 5,
            margin: 5,
            border: '2px solid currentColor',
          }}
          onClick={() => {
            setViewportReservedWidth(0);
          }}>
          Click to reset viewportReservedWidth to 0
        </button>
      </div>
      <DataSource<Employee>
        data={dataSource}
        primaryKey="id">
        <InfiniteTable<Employee>
          columns={columns}
          columnDefaultWidth={50}
          viewportReservedWidth={viewportReservedWidth}
          onViewportReservedWidthChange={
            setViewportReservedWidth
          }
          defaultColumnSizing={defaultColumnSizing}
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

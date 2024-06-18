import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
  components,
} from '@infinite-table/infinite-react';
import * as React from 'react';
import { useState } from 'react';

const { CheckBox } = components;

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
    header: 'Location: City',
  },
  salary: {
    field: 'salary',
    type: 'number',
    header: 'Salary',
  },
};

export default function App() {
  const [reserveSpaceForSortIcon, setReserveSpaceForSortIcon] = useState(true);
  return (
    <>
      <div style={{ color: 'var(--infinite-cell-color)', padding: 10 }}>
        <CheckBox
          checked={reserveSpaceForSortIcon}
          onChange={() => setReserveSpaceForSortIcon((prev) => !prev)}
        ></CheckBox>
        Reserve space for sort icon
      </div>
      <DataSource<Employee> data={dataSource} primaryKey="id">
        <InfiniteTable<Employee>
          headerOptions={{
            alwaysReserveSpaceForSortIcon: reserveSpaceForSortIcon,
          }}
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

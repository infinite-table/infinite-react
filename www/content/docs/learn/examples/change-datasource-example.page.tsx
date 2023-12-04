import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import { useMemo, useState } from 'react';

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
  streetPrefix: string;
  streetNo: string;
  department: string;
  team: string;
  salary: number;
  currency: number;
  age: number;
  email: string;
};

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

export const employeeColumns: InfiniteTablePropColumns<Employee> = {
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
  streetName: { field: 'streetName' },
  streetNo: { field: 'streetNo', type: 'number' },
  currency: {
    field: 'currency',
    type: 'number',
  },
  email: { field: 'email' },
};

const developerColumns: InfiniteTablePropColumns<Developer> = {
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
  country: {
    field: 'country',
    // specifying a style here for the column
    // note: it will also be "picked up" by the group column
    // if you're grouping by the 'country' field
    style: {
      color: 'tomato',
    },
  },
  canDesign: { field: 'canDesign' },
  salary: {
    field: 'salary',
    type: 'number',
  },
};

const getDataSourceFor = (name: 'employee' | 'developer', size: string) => {
  if (size === '0') {
    return () => Promise.resolve([]);
  }
  return () => {
    return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/${name}s` + size)
      .then((r) => r.json())
      .then((data: Employee[]) => data);
  };
};

export default function App() {
  const [dataSourceSize, setDataSourceSize] = useState<string>('10k');
  const [type, setType] = useState<'employee' | 'developer'>('employee');

  const dataSource = useMemo(() => {
    return getDataSourceFor(type, dataSourceSize);
  }, [type, dataSourceSize]);

  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        color: 'var(--infinite-cell-color)',
        flexFlow: 'column',
      }}
    >
      <p style={{ paddingInline: 10 }}>Please select datasource:</p>
      <div style={{ paddingInline: 10 }}>
        <select
          style={{
            display: 'inline-block',
            background: 'var(--infinite-background)',
            color: 'currentColor',
            padding: 'var(--infinite-space-3)',
          }}
          value={type}
          onChange={(event) => {
            const type = event.target.value as 'employee' | 'developer';

            setType(type);
          }}
        >
          <option value="developer">Developers</option>
          <option value="employee">Employees</option>
        </select>
      </div>
      <p style={{ paddingInline: 10 }}>
        Please select the size of the datasource:
      </p>
      <div style={{ paddingInline: 10, marginBottom: 10 }}>
        <select
          style={{
            display: 'inline-block',
            background: 'var(--infinite-background)',
            color: 'currentColor',
            padding: 'var(--infinite-space-3)',
          }}
          value={dataSourceSize}
          onChange={(event) => {
            const newSize = event.target.value as string;

            setDataSourceSize(newSize);
          }}
        >
          <option value="0">no items</option>
          <option value="10">10 items</option>
          <option value="100">100 items</option>
          <option value="1k">1k items</option>
          <option value="10k">10k items</option>
        </select>
      </div>
      <DataSource<any> data={dataSource} primaryKey="id">
        <InfiniteTable<any>
          columns={type === 'developer' ? developerColumns : employeeColumns}
          columnDefaultWidth={150}
        />
      </DataSource>
    </div>
  );
}

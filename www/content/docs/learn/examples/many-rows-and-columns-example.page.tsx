import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
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
  companySize: {
    field: 'companySize',
    header: 'Company Size',
  },
  streetName: { field: 'streetName' },
  streetNo: { field: 'streetNo' },
  currency: { field: 'currency' },
  email: { field: 'email' },
};

const getDataSourceFor = (size: string) => {
  if (size === '0') {
    return () => Promise.resolve([]);
  }
  return () => {
    return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees' + size)
      .then((r) => r.json())
      .then((data: Employee[]) => data);
  };
};

export default function App() {
  const [dataSourceSize, setDataSourceSize] = useState<string>('10k');

  const dataSource = useMemo(() => {
    return getDataSourceFor(dataSourceSize);
  }, [dataSourceSize]);
  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        color: 'var(--infinite-cell-color)',
        flexFlow: 'column',
      }}
    >
      <p style={{ padding: 10, marginBlock: 0 }}>
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
      <DataSource<Employee> data={dataSource} primaryKey="id">
        <InfiniteTable<Employee> columns={columns} columnDefaultWidth={150} />
      </DataSource>
    </div>
  );
}

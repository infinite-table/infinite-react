import * as React from 'react';
import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumnSizing,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';

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
  const [columnSizing, setColumnSizing] =
    React.useState<InfiniteTablePropColumnSizing>({
      country: { width: 100 },
      city: { flex: 1, minWidth: 300 },
      salary: { flex: 2 },
    });

  return (
    <>
      <div>
        Current column sizing:{' '}
        <code style={{ color: 'tomato' }}>
          <pre>{JSON.stringify(columnSizing, null, 2)}</pre>
        </code>
      </div>
      <DataSource<Employee> data={dataSource} primaryKey="id">
        <InfiniteTable<Employee>
          domProps={{
            style: {
              height: 600,
            },
          }}
          columns={columns}
          columnDefaultWidth={50}
          columnSizing={columnSizing}
          onColumnSizingChange={setColumnSizing}
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

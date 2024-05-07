import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';
import { Sparklines, SparklinesLine } from 'react-sparklines';

export type Employee = {
  id: number;
  companyName: string;
  companySize: string;
  firstName: string;
  lastName: string;
  country: string;
  countryCode: string;
  city: string;
  bugFixes: number[];
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
  bugFixes: {
    field: 'bugFixes',
    header: 'Bug Fixes',
    defaultWidth: 300,
    renderValue: ({ value }) => {
      return (
        <Sparklines
          data={value}
          style={{
            width: '100%',
          }}
          height={30}
        >
          <SparklinesLine color="#253e56" />
        </Sparklines>
      );
    },
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
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees10k')
    .then((r) => r.json())
    .then((data: Employee[]) => {
      return data.map((employee) => {
        return {
          ...employee,
          bugFixes: [...Array(10)].map(() => Math.round(Math.random() * 100)),
        };
      });
    });
};

export default function App() {
  return (
    <DataSource<Employee> data={dataSource} primaryKey="id">
      <InfiniteTable<Employee> columns={columns} columnDefaultWidth={150} />
    </DataSource>
  );
}

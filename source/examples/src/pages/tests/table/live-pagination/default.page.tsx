import {
  DataSourceDataParams,
  InfiniteTable,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';
import fetch from 'isomorphic-fetch';
import * as React from 'react';

export const columns = new Map<string, InfiniteTableColumn<Employee>>([
  ['id', { field: 'id' }],
  [
    'country',
    {
      field: 'country',
    },
  ],
  ['city', { field: 'city' }],
  ['team', { field: 'team' }],
  ['department', { field: 'department' }],
  ['firstName', { field: 'firstName' }],
  ['lastName', { field: 'lastName' }],
  ['salary', { field: 'salary' }],
  ['age', { field: 'age' }],
]);

type Employee = {
  id: number;
  companyName: string;
  companySize: string;
  firstName: string;
  lastName: string;
  country: string;
  countryCode: string;
  city: string;
  streetName: string;
  streetNo: number;
  department: string;
  team: string;
  salary: number;
  age: number;
  email: string;
};

const dataSource = (params: DataSourceDataParams<Employee>) => {
  console.log(params);
  return fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL!}/employees100?_limit=10&_start=${
      params.append ? params.originalDataArray.length : 0
    }`,
  )
    .then(async (r) => {
      const data = await r.json();

      const total = Number(r.headers.get('X-Total-Count')!);
      return { data, total };
    })
    .then(({ data, total }: { data: Employee[]; total: number }) => {
      return { data, total };
    })
    .then((data) => {
      return new Promise<{ data: Employee[]; total: number }>((resolve) => {
        setTimeout(() => {
          resolve(data);
        }, 100);
      });
    });
};

const domProps = {
  style: {
    margin: '5px',
    height: '60vh',
    width: '95vw',
    border: '1px solid gray',
    position: 'relative',
  } as React.CSSProperties,
};

const App = () => {
  return (
    <React.StrictMode>
      <DataSource<Employee> primaryKey="id" data={dataSource} livePagination>
        <InfiniteTable<Employee>
          domProps={domProps}
          columnDefaultWidth={440}
          columnMinWidth={50}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
};

export default App;

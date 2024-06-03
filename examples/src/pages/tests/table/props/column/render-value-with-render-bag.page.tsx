import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import { Employee } from './employees10';

const dataSource = () => {
  const data: Employee[] = [
    {
      age: 1,
      city: 'test',
      companyName: 'test',
      companySize: '1 - 10',
      country: 'test',
      countryCode: 'test',
      department: 'test',
      email: 'test@test.com',
      firstName: 'Mark',
      lastName: 'test',
      id: 1,
      salary: 5000,
      streetName: 'test',
      streetNo: 1,
      team: 'test',
    },
  ];

  return Promise.resolve(data);
};

const domProps: React.HTMLAttributes<HTMLDivElement> = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative',
  },
};

export default function ColumnValueFormatter() {
  const [state, setState] = React.useState(0);

  const columns: Record<string, InfiniteTableColumn<Employee>> = {
    firstName: {
      field: 'firstName',
      header: 'First Name',
      renderValue: (params) => {
        return <button data-name="target">x {params.renderBag.value}</button>;
      },
      // renderValue: (params) => {
      //   return (
      //     <>
      //       <button>{params.renderBag.value}</button> - x - {state}
      //     </>
      //   );
      // },
      // render: (params) => {
      //   return <>aha {params.renderBag.value}</>;
      // },
    },
  };
  return (
    <>
      <button
        onClick={() => {
          setState(state + 1);
        }}
      >
        increment state
      </button>
      Current state: {state}
      <DataSource<Employee> data={dataSource} primaryKey="id">
        <InfiniteTable<Employee>
          domProps={domProps}
          columnDefaultWidth={150}
          columns={columns}
        />
      </DataSource>
    </>
  );
}

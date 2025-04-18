import * as React from 'react';

import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
  DataSourceGroupBy,
  InfiniteTablePropColumnGroups,
  DataSourcePropAggregationReducers,
} from '@infinite-table/infinite-react';

import { employees } from './employees10';

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

const dataSource = () => {
  return Promise.resolve(employees);
};

const columns: Record<string, InfiniteTableColumn<Employee>> = {
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
  streetName: {
    field: 'streetName',
    header: 'Street Name',
    columnGroup: 'street',
  },
  streetNo: {
    columnGroup: 'street',
    field: 'streetNo',
    header: 'Street Number',
  },
  age: {
    field: 'age',
    type: 'number',
    header: 'Age',
  },
  department: {
    field: 'department',
    header: 'Department',
  },
  salary: {
    field: 'salary',
    type: 'number',
    header: 'Salary',

    render: ({ value, rowInfo }) => {
      if (rowInfo.isGroupRow) {
        return (
          <>
            Avg salary <b>{rowInfo.groupKeys?.join(', ')}</b>:{' '}
            <b>{rowInfo.reducerResults![0]}</b>
          </>
        );
      }
      return <>{value}</>;
    },
  },
  team: {
    field: 'team',
    header: 'Team',
  },

  company: { field: 'companyName', header: 'Company' },
  companySize: { field: 'companySize', header: 'Company Size' },
};

const columnGroups: InfiniteTablePropColumnGroups = {
  address: { columnGroup: 'location', header: 'Address' },
  street: { columnGroup: 'address', header: 'Street' },
  location: { header: 'Location' },
};

const reducers: DataSourcePropAggregationReducers<Employee> = {
  salary: {
    field: 'salary',
    initialValue: 0,
    reducer: (acc, sum) => acc + sum,
    done: (sum, arr) => Math.floor(arr.length ? sum / arr.length : 0),
  },
};

// const groupRowsState = new GroupRowsState({
//   expandedRows: [['Cuba', 'Havana'], ['Cuba']],
//   collapsedRows: true,
// });

const groupBy: DataSourceGroupBy<Employee>[] = [
  {
    field: 'country',
  },
  { field: 'city' },
];
export default function GroupByExample() {
  return (
    <React.StrictMode>
      <DataSource<Employee>
        data={dataSource}
        primaryKey="id"
        defaultGroupBy={groupBy}
        aggregationReducers={reducers}
      >
        <InfiniteTable<Employee>
          domProps={{
            style: {
              margin: '5px',
              height: 900,
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          groupColumn={{
            header: 'group col',
            defaultWidth: 200,
            renderValue: ({ value }) => {
              return <>{value}!</>;
            },
          }}
          groupRenderStrategy="single-column"
          columnDefaultWidth={100}
          columns={columns}
          columnGroups={columnGroups}
        />
      </DataSource>
    </React.StrictMode>
  );
}

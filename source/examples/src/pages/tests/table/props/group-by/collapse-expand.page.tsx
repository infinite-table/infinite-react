import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
  GroupRowsState,
  DataSourceGroupBy,
  DataSourcePropAggregationReducers,
} from '@infinite-table/infinite-react';
import { InfiniteTablePropColumnGroups } from '@src/components/InfiniteTable/types/InfiniteTableProps';
import * as React from 'react';

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
  // return fetch(`${process.env.NEXT_PUBLIC_BASE_URL!}/employees10`)
  // .then((r) => r.json())
  // .then((data: Employee[]) => {
  //   return data;
  // });
};

const columns = new Map<string, InfiniteTableColumn<Employee>>([
  [
    'firstName',
    {
      field: 'firstName',
      header: 'First Name',
    },
  ],

  [
    'country',
    {
      field: 'country',
      header: 'Country',

      columnGroup: 'location',
      render: ({ value, rowInfo }) => {
        console.log(rowInfo);
        const { isGroupRow, groupKeys } = rowInfo;
        if (isGroupRow) {
          return <>Group for {groupKeys?.join(',')}</>;
        }
        return <b>{value}x</b>;
      },
    },
  ],

  [
    'city',
    {
      field: 'city',
      header: 'City',
      columnGroup: 'address',
    },
  ],

  [
    'streetName',
    {
      field: 'streetName',
      header: 'Street Name',
      columnGroup: 'street',
    },
  ],
  [
    'streetNo',
    {
      columnGroup: 'street',
      field: 'streetNo',
      header: 'Street Number',
    },
  ],

  [
    'age',
    {
      field: 'age',
      type: 'number',
      header: 'Age',
    },
  ],
  [
    'department',
    {
      field: 'department',
      header: 'Department',
    },
  ],
  [
    'salary',
    {
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
  ],
  [
    'team',
    {
      field: 'team',
      header: 'Team',
    },
  ],
  ['company', { field: 'companyName', header: 'Company' }],
  ['companySize', { field: 'companySize', header: 'Company Size' }],
]);

const columnGroups: InfiniteTablePropColumnGroups = new Map([
  ['address', { columnGroup: 'location', header: 'Address' }],
  ['street', { columnGroup: 'address', header: 'Street' }],
  ['location', { header: 'Location' }],
]);

const reducers: DataSourcePropAggregationReducers<Employee> = {
  salary: {
    initialValue: 0,
    field: 'salary',

    reducer: (acc, sum) => acc + sum,
    done: (sum, arr) => Math.floor(arr.length ? sum / arr.length : 0),
  },
};

const groupRowsState = new GroupRowsState({
  expandedRows: [['Cuba', 'Havana'], ['Cuba']],
  collapsedRows: true,
});

const groupBy: DataSourceGroupBy<Employee>[] = [
  {
    field: 'country',
  },
  { field: 'city', column: { header: 'hey' } },
];
export default function GroupByExample() {
  return (
    <React.StrictMode>
      <DataSource<Employee>
        data={dataSource}
        primaryKey="id"
        groupBy={groupBy}
        aggregationReducers={reducers}
        defaultGroupRowsState={groupRowsState}
        onGroupRowsStateChange={(state) => {
          console.log(state);
        }}
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
          groupColumn={({
            groupBy,
          }: {
            groupBy: DataSourceGroupBy<Employee>;
          }) => {
            return {
              // width: 300,
              header: `Group ${groupBy?.field}`,
            };
          }}
          columnDefaultWidth={100}
          columns={columns}
          columnGroups={columnGroups}
        />
      </DataSource>
    </React.StrictMode>
  );
}

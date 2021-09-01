import * as React from 'react';

import fetch from 'isomorphic-fetch';

import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
} from '@infinite-table/infinite-react';

import { InfiniteTablePropColumnAggregations } from '@src/components/InfiniteTable/types/InfiniteTableProps';

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
  streetNo: string;
  department: string;
  team: string;
  salary: number;
  age: number;
  email: string;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_DATAURL!)
    .then((r) => r.json())
    .then((data: Employee[]) => {
      console.log(data);
      return data;
    });
};

const columns = new Map<string, InfiniteTableColumn<Employee>>([
  [
    'groupcol',
    {
      type: 'number',
      header: 'Group',
      render: ({ value, enhancedData }) => {
        return (
          <div
            style={{
              paddingLeft:
                ((enhancedData.groupNesting || 0) +
                  (enhancedData.isGroupRow ? 0 : 1)) *
                30,
            }}
          >
            {enhancedData.groupKeys ? enhancedData.value : value ?? null}
          </div>
        );
      },
    },
  ],
  [
    'firstName',
    {
      width: 100,
      field: 'firstName',
    },
  ],

  [
    'country',
    {
      width: 100,
      field: 'country',
    },
  ],
  [
    'department',
    {
      field: 'department',
    },
  ],
  [
    'age',
    {
      field: 'age',
      type: 'number',
    },
  ],
  [
    'salary',
    {
      field: 'salary',
      type: 'number',
      width: 300,
      render: ({ value, enhancedData }) => {
        if (enhancedData.isGroupRow) {
          return (
            <>
              Avg salary <b>{enhancedData.groupKeys?.join(', ')}</b>:{' '}
              <b>{enhancedData.reducerResults![0]}</b>
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
      width: 200,
      field: 'team',
    },
  ],
]);
const columnAggregations: InfiniteTablePropColumnAggregations<Employee> =
  new Map([
    [
      'salary',
      {
        initialValue: 0,
        getter: (data) => data.salary,
        reducer: (acc, sum) => acc + sum,
        done: (sum, arr) => (arr.length ? sum / arr.length : 0),
      },
    ],
  ]);
export default function GroupByExample() {
  const [x, setx] = React.useState(0);

  const rerender = () => setx((x) => x + 1);
  return (
    <React.StrictMode>
      <button onClick={rerender}>update</button>
      <DataSource<Employee>
        data={dataSource}
        primaryKey="id"
        // groupRowsBy={[{ field: 'department' }, { field: 'team' }]}
      >
        <InfiniteTable<Employee>
          domProps={{
            style: {
              margin: '5px',
              height: '80vh',
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          columnDefaultWidth={150}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
}

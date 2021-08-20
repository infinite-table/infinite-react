import * as React from 'react';

import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
} from '@infinite-table/infinite-react';
import { data, Person } from './people';
import { InfiniteTablePropColumnAggregations } from '@infinite-table/infinite-react/components/InfiniteTable/types/InfiniteTableProps';

const columns = new Map<string, InfiniteTableColumn<Person>>([
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
    'name',
    {
      width: 100,
      field: 'name',
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
const columnAggregations: InfiniteTablePropColumnAggregations<Person> = new Map(
  [
    [
      'salary',
      {
        initialValue: 0,
        reducer: (acc, sum) => acc + sum,
        done: (sum, arr) => (arr.length ? sum / arr.length : 0),
      },
    ],
  ],
);
export default function GroupByExample() {
  return (
    <React.StrictMode>
      <DataSource<Person>
        data={data}
        primaryKey="id"
        groupRowsBy={[{ field: 'department' }, { field: 'team' }]}
      >
        <InfiniteTable<Person>
          domProps={{
            style: {
              margin: '5px',
              height: '80vh',
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          columnAggregations={columnAggregations}
          columnDefaultWidth={150}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
}

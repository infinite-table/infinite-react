import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
  DataSourcePropAggregationReducers,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import { data, Person } from './people';

const columns: Record<string, InfiniteTableColumn<Person>> = {
  name: {
    field: 'name',
  },
  country: {
    field: 'country',
  },
  department: {
    field: 'department',
  },
  age: {
    field: 'age',
    type: 'number',
  },
  salary: {
    type: 'number',
    header: 'Salary',
    valueGetter: ({ data }) => data.salary,

    render: ({ value, rowInfo }) => {
      if (rowInfo.isGroupRow) {
        return (
          <>
            Avg salary <b>{rowInfo.groupKeys?.join(', ')}</b>:{' '}
            <b>{rowInfo.reducerResults?.salary}</b>
          </>
        );
      }
      return <>{value}</>;
    },
  },
  team: {
    field: 'team',
  },
};
const columnAggregations: DataSourcePropAggregationReducers<Person> = {
  salary: {
    initialValue: 0,
    getter: (row) => row.salary * 100,
    // field: 'salary',
    reducer: (acc, sum) => acc + sum,
    done: (sum, arr) => (arr.length ? sum / arr.length : 0),
  },
};

export default function GroupByExample() {
  return (
    <React.StrictMode>
      <DataSource<Person>
        data={data}
        defaultFilterValue={
          [
            // {
            //   field: 'team',
            //   filter: {
            //     operator: 'includes',
            //     value: 'bac',
            //     type: 'string',
            //   },
            // },
          ]
        }
        rowInfoReducers={React.useMemo(
          () => ({
            age: {
              initialValue: () => {
                console.log('compute age', 0);
                return {
                  value: 0,
                  count: 0,
                };
              },
              reducer: (acc, rowInfo) => {
                if (!rowInfo.isGroupRow) {
                  acc.value += rowInfo.data.age;
                  acc.count++;
                }
                return acc;
              },
              done: (value) => {
                const res = value.count ? value.value / value.count : 0;

                console.log('result is', res, 'count', value.count);
                return res;
              },
            },
          }),
          [],
        )}
        primaryKey="id"
        groupBy={React.useMemo(
          () => [
            {
              field: 'team',
            },
          ],
          [],
        )}
        aggregationReducers={columnAggregations}
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
          columnDefaultWidth={150}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
}

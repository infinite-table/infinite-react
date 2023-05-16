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
    defaultWidth: 200,
    align: () => {
      return 'end';
    },
    renderValue: ({ value }) => {
      return <>{value}.</>;
    },
  },
  country: {
    defaultWidth: 200,
    // field: 'xxx',
    // field: 'country',
    // valueGetter: ({ data }) => {
    //   return data.country;
    // },
    align: 'center',
    renderValue: ({ value }) => {
      return <>{value}!</>;
    },
  },
  department: {
    field: 'department',
  },
  age: {
    field: 'age',
    type: 'number',
  },
  salary: {
    field: 'salary',
    type: 'number',

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
  },
};
const columnAggregations: DataSourcePropAggregationReducers<Person> = {
  salary: {
    initialValue: 0,
    field: 'salary',
    reducer: (acc, sum) => acc + sum,
    done: (sum, arr) => (arr.length ? sum / arr.length : 0),
  },
};

export default function GroupByExample() {
  return (
    <React.StrictMode>
      <DataSource<Person>
        data={data}
        primaryKey="id"
        groupBy={[{ field: 'department' }, { field: 'team' }]}
        aggregationReducers={columnAggregations}
        // pivotBy={[
        //   {
        //     field: 'country',
        //   },
        //   { field: 'age' },
        //   { field: 'salary' },
        // ]}
      >
        {({ pivotColumns, pivotColumnGroups }) => {
          return (
            <InfiniteTable<Person>
              domProps={{
                style: {
                  margin: '5px',
                  height: '80vh',
                  border: '1px solid gray',
                  position: 'relative',
                },
              }}
              groupRenderStrategy="single-column"
              groupColumn={{
                field: 'department',
                align: ({ value, isGroupRow, isHeader }) => {
                  if (isHeader) {
                    return 'end';
                  }
                  if (isGroupRow) {
                    return 'start';
                  }
                  return value === 'it' ? 'center' : 'end';
                },
                defaultWidth: 300,
              }}
              columnDefaultWidth={150}
              columns={pivotColumns ?? columns}
              columnGroups={pivotColumnGroups}
            />
          );
        }}
      </DataSource>
    </React.StrictMode>
  );
}

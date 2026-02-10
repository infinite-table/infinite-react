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
    defaultEditable: true,
    renderValue: ({ value }) => {
      return `${value}-${Date.now()}`;
    },
    header: () => {
      return <div>Age-{Date.now()}</div>;
    },
    getValueToPersist: ({ value }) => {
      return Number(value);
    },
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
  age: {
    initialValue: 0,
    field: 'age',
    reducer: (acc, sum) => acc + sum,
    done: (sum, arr) =>
      arr.length ? Math.round((sum / arr.length) * 100) / 100 : 0,
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

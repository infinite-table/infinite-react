import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
  DataSourcePropAggregationReducers,
  DataSourceGroupBy,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import { data, Person } from './people';

const columns: Record<string, InfiniteTableColumn<Person>> = {
  name: {
    field: 'name',
  },
  department: {
    field: 'department',
    style: {
      color: 'red',
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

export default function App() {
  const groupBy: DataSourceGroupBy<Person>[] = [
    {
      field: 'department',
    },
    { field: 'team' },
  ];

  return (
    <React.StrictMode>
      <DataSource<Person>
        data={data.slice(0, 5)}
        primaryKey="id"
        groupBy={groupBy}
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
          groupRenderStrategy="single-column"
          columnDefaultWidth={250}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
}

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
  country: {
    field: 'country',
  },
  department: {
    field: 'department',
    header: 'Department',
    style: {
      color: 'red',
    },
  },
  age: {
    field: 'age',
    type: 'number',
  },
  salary: {
    field: 'salary',
    type: 'number',
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
  const [useField, setUseField] = React.useState(true);
  const [useKnownGroupField, setUseKnownGroupField] = React.useState(false);

  const groupBy: DataSourceGroupBy<Person>[] = React.useMemo(() => {
    if (useField) {
      return [
        {
          field: 'department',
        },
        { field: 'team' },
      ];
    }

    return [
      {
        groupField: useKnownGroupField ? 'department' : 'xxx',
        valueGetter: ({ data }) => `Department: ${data.department}-${data.age}`,
      },
      { field: 'team' },
    ];
  }, [useField, useKnownGroupField]);

  return (
    <React.StrictMode>
      <label style={{ color: 'magenta' }}>
        Use field in groupBy
        <input
          type="checkbox"
          checked={useField}
          onChange={() => setUseField(!useField)}
        />
      </label>

      <label style={{ color: 'magenta' }}>
        Use known group field in groupBy
        <input
          type="checkbox"
          checked={useKnownGroupField}
          onChange={() => setUseKnownGroupField(!useKnownGroupField)}
        />
      </label>
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
          groupColumn={{
            field: 'department',
          }}
          groupRenderStrategy="single-column"
          columnDefaultWidth={250}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
}

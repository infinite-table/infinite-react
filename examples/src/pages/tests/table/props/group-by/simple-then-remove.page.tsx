import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
  DataSourcePropGroupBy,
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
    field: 'salary',
    type: 'number',
  },
};

const initialGroupBy: DataSourcePropGroupBy<Person> = [
  { field: 'department' },
  { field: 'team' },
];
export default function GroupByExample() {
  const [groupBy, setGroupBy] =
    React.useState<DataSourcePropGroupBy<Person>>(initialGroupBy);
  return (
    <>
      <button data-name="reset" onClick={() => setGroupBy([])}>
        Clear grouping
      </button>
      <button data-name="restore" onClick={() => setGroupBy(initialGroupBy)}>
        Restore grouping
      </button>
      <React.StrictMode>
        <DataSource<Person> data={data} primaryKey="id" groupBy={groupBy}>
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
    </>
  );
}

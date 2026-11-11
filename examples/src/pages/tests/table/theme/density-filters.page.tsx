import {
  DataSource,
  DataSourcePropFilterValue,
  InfiniteTable,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import { employees } from '../props/group-by/employees10';

type Employee = {
  id: number;
  firstName: string;
  country: string;
  department: string;
  age: number;
};

const columns: InfiniteTablePropColumns<Employee> = {
  firstName: { field: 'firstName', header: 'First Name' },
  department: { field: 'department', header: 'Department' },
  age: { field: 'age', type: 'number', header: 'Age' },
};

const defaultFilterValue: DataSourcePropFilterValue<Employee> = [
  {
    field: 'department',
    filter: { type: 'string', operator: 'includes', value: 'e' },
  },
];

export default function App() {
  const [density, setDensity] = React.useState('');

  return (
    <div>
      <button data-name="compact" onClick={() => setDensity('compact')}>
        compact
      </button>
      <button data-name="spacious" onClick={() => setDensity('spacious')}>
        spacious
      </button>
      <div
        id="wrapper"
        className={density ? `infinite-density--${density}` : ''}
      >
        <DataSource<Employee>
          data={employees as Employee[]}
          primaryKey="id"
          defaultGroupBy={[{ field: 'country' }]}
          defaultFilterValue={defaultFilterValue}
        >
          <InfiniteTable<Employee>
            domProps={{ style: { height: '500px' } }}
            columns={columns}
          >
            <InfiniteTable.GroupingToolbar />
            <InfiniteTable.Header />
            <InfiniteTable.Body />
          </InfiniteTable>
        </DataSource>
      </div>
    </div>
  );
}

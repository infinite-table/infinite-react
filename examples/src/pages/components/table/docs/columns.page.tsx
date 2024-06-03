import * as React from 'react';

import {
  DataSource,
  InfiniteTable,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';

type Employee = {
  id: number;
  firstName: string;
  lastName: string;
};

// we're ready to define columns
const columns: Record<string, InfiniteTableColumn<Employee>> = {
  // the key in the columns map will be used as the column id
  first: {
    field: 'firstName',
  },
};

(globalThis as any).columns = columns;
// and add some data
const data: Employee[] = [
  { id: 1, firstName: 'John', lastName: 'Bobson' },
  { id: 2, firstName: 'Mary', lastName: 'Richardson' },
];

const domProps = {
  style: { height: '50vh', border: '1px solid gray' },
};

const App = () => {
  return (
    <DataSource<Employee> primaryKey="id" data={data}>
      <InfiniteTable<Employee>
        domProps={domProps}
        columns={columns}
        columnMinWidth={100}
      />
    </DataSource>
  );
};
export default App;

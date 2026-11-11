import {
  DataSource,
  DataSourceGroupBy,
  DataSourcePropFilterValue,
  DataSourcePropSortInfo,
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
  salary: number;
};

const columns: InfiniteTablePropColumns<Employee> = {
  firstName: { field: 'firstName', header: 'First Name' },
  department: { field: 'department', header: 'Department' },
  age: { field: 'age', type: 'number', header: 'Age' },
  salary: { field: 'salary', type: 'number', header: 'Salary' },
};

const groupBy: DataSourceGroupBy<Employee>[] = [{ field: 'country' }];

const defaultSortInfo: DataSourcePropSortInfo<Employee> = [
  { field: 'firstName', dir: 1 },
  { field: 'age', dir: -1 },
];

const defaultFilterValue: DataSourcePropFilterValue<Employee> = [
  {
    field: 'department',
    filter: { type: 'string', operator: 'includes', value: 'e' },
  },
];

const domProps = {
  style: { height: '600px', margin: '10px' },
};

export default function App() {
  return (
    <DataSource<Employee>
      data={employees as Employee[]}
      primaryKey="id"
      groupBy={groupBy}
      defaultSortInfo={defaultSortInfo}
      defaultFilterValue={defaultFilterValue}
    >
      <InfiniteTable<Employee>
        domProps={domProps}
        columns={columns}
        columnDefaultWidth={220}
      />
    </DataSource>
  );
}

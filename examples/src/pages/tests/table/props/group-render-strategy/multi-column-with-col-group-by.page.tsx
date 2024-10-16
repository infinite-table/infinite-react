import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourceGroupBy,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';
import { Person, data } from './pivotData';

const domProps = {
  style: {
    height: '60vh',
    border: '1px solid gray',
    width: 'calc(100% - 20px)',
    marginLeft: 10,
  },
};

const groupBy: DataSourceGroupBy<Person>[] = [
  {
    field: 'department',
    column: {
      id: 'dep-group',
      header: 'Department grouping',
      headerStyle: {
        color: 'red',
      },
      style: {
        color: 'rgb(0, 255, 0)',
      },
    },
  },
  {
    field: 'team',
  },
];

const columns: Record<string, InfiniteTableColumn<Person>> = {
  department: {
    field: 'department',
  },
  team: {
    field: 'team',
  },
  id: { field: 'id' },
  name: { field: 'name' },
  country: { field: 'country' },

  salary: {
    field: 'salary',
  },
};

export default function GroupRenderStrategyInline() {
  return (
    <DataSource<Person> primaryKey="id" data={data} groupBy={groupBy}>
      <InfiniteTable<Person>
        domProps={domProps}
        columns={columns}
        columnDefaultWidth={150}
        groupRenderStrategy={'multi-column'}
      ></InfiniteTable>
    </DataSource>
  );
}

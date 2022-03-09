import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourceGroupBy,
  InfiniteTablePropColumns,
  InfiniteTableColumn,
  GroupRowsState,
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

const formatter = new Intl.NumberFormat();
const groupBy: DataSourceGroupBy<Person>[] = [
  {
    field: 'department',
  },
  {
    field: 'team',
  },
];

const groupRowsState = new GroupRowsState({
  collapsedRows: [],
  expandedRows: true,
});

const columns: InfiniteTablePropColumns<Person> = new Map<
  string,
  InfiniteTableColumn<Person>
>([
  [
    'department',
    {
      field: 'department',
    },
  ],
  [
    'team',
    {
      field: 'team',
    },
  ],
  ['id', { field: 'id' }],
  ['name', { field: 'name' }],
  ['country', { field: 'country' }],
  [
    'salary',
    {
      field: 'salary',

      render: ({ value }) =>
        value ? `$ ${formatter.format(value as any as number)}` : null,
    },
  ],
]);

export default function GroupByExample() {
  return (
    <DataSource<Person>
      primaryKey="id"
      data={data}
      groupBy={groupBy}
      defaultGroupRowsState={groupRowsState}
    >
      <InfiniteTable<Person>
        domProps={domProps}
        columns={columns}
        columnDefaultWidth={280}
        groupRenderStrategy={'inline'}
      ></InfiniteTable>
    </DataSource>
  );
}

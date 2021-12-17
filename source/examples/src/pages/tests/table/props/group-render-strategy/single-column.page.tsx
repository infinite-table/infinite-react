import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourceGroupRowsBy,
  InfiniteTablePropColumns,
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

const groupRowsBy: DataSourceGroupRowsBy<Person>[] = [
  {
    field: 'department',
  },
  {
    field: 'team',
  },
];

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
    },
  ],
]);

export default function GroupRenderStrategyInline() {
  return (
    <DataSource<Person> primaryKey="id" data={data} groupRowsBy={groupRowsBy}>
      <InfiniteTable<Person>
        domProps={domProps}
        columns={columns}
        columnDefaultWidth={280}
        groupRenderStrategy={'single-column'}
      ></InfiniteTable>
    </DataSource>
  );
}

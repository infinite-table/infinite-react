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
    },
  },
  {
    field: 'team',
    column: {
      id: 'my-custom-team-group',
      style: {
        color: 'rgb(255, 0, 0)',
      },
      headerStyle: {
        color: 'red',
      },
    },
  },
  {
    field: 'country',
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
};

export default function GroupRenderStrategyInline() {
  return (
    <DataSource<Person> primaryKey="id" data={data} groupBy={groupBy}>
      <InfiniteTable<Person>
        domProps={domProps}
        columns={columns}
        groupColumn={({ groupByForColumn }) => {
          const col: Partial<InfiniteTableColumn<Person> & { id: string }> = {
            style: {
              color: 'rgb(0, 100, 0)',
            },
          };
          if (groupByForColumn?.field === 'department') {
            col.id = 'xx-dep-xx';
          }

          return col;
        }}
        columnDefaultWidth={140}
        groupRenderStrategy={'multi-column'}
      ></InfiniteTable>
    </DataSource>
  );
}

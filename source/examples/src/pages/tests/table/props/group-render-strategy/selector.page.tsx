import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourceGroupRowsBy,
  InfiniteTablePropColumns,
  InfiniteTableColumn,
  InfiniteTablePropGroupRenderStrategy,
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
  const [groupRenderStrategy, setGroupRenderStrategy] =
    React.useState<InfiniteTablePropGroupRenderStrategy>('multi-column');
  return (
    <div
      className="dark"
      style={{
        display: 'flex',
        flex: 1,
        flexFlow: 'column',
      }}
    >
      <p>Please select the group render strategy</p>
      <div style={{ padding: 10 }}>
        <select
          style={{
            margin: '10px 0',
            display: 'inline-block',
            background: 'var(--infinite-background)',
            color: 'var(--infinite-cell-color)',
            padding: 'var(--infinite-space-3)',
          }}
          value={groupRenderStrategy}
          onChange={(event) => {
            const groupRenderStrategy = event.target
              .value as InfiniteTablePropGroupRenderStrategy;

            setGroupRenderStrategy(groupRenderStrategy);
          }}
        >
          <option value="multi-column">multi-column</option>
          <option value="single-column">single-column</option>
          <option value="inline">inline</option>
        </select>
      </div>

      <DataSource<Person> primaryKey="id" data={data} groupRowsBy={groupRowsBy}>
        <InfiniteTable<Person>
          domProps={domProps}
          columns={columns}
          columnDefaultWidth={280}
          groupRenderStrategy={groupRenderStrategy}
        ></InfiniteTable>
      </DataSource>
    </div>
  );
}

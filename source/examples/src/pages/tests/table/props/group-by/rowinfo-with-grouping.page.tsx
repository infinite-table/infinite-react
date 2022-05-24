import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
  DataSourceGroupBy,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import { Person, data } from './rowinfo-with-grouping-data';

const dataSource = () => {
  return Promise.resolve(data);
};

const columns = new Map<string, InfiniteTableColumn<Person>>([
  [
    'firstName',
    {
      field: 'firstName',
      header: 'First Name',
      render: ({ value, rowInfo }) => {
        return (
          <>
            {value} {rowInfo.indexInAll}!
          </>
        );
      },
      // render: ({ rowInfo }: { rowInfo: InfiniteTableRowInfo<Person> }) => {
      //   if (!rowInfo.dataSourceHasGrouping) {
      //     return null;
      //   }
      //   return rowInfo.groupKeys.join(' - ');
      // },
    },
  ],
]);
const groupBy: DataSourceGroupBy<Person>[] = [
  {
    field: 'country',
  },
  { field: 'city' },
];

export default function GroupByExample() {
  return (
    <React.StrictMode>
      <DataSource<Person> data={dataSource} primaryKey="id" groupBy={groupBy}>
        {({ dataArray }) => {
          (globalThis as any).dataArray = dataArray;
          return (
            <InfiniteTable<Person>
              domProps={{
                style: {
                  margin: '5px',
                  height: 900,
                  border: '1px solid gray',
                  position: 'relative',
                },
              }}
              groupRenderStrategy="single-column"
              columnDefaultWidth={300}
              columns={columns}
            />
          );
        }}
      </DataSource>
    </React.StrictMode>
  );
}

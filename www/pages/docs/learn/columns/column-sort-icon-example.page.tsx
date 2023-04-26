import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
  useInfiniteHeaderCell,
} from '@infinite-table/infinite-react';

import * as React from 'react';

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id', // will be used as default label in column header
    defaultWidth: 100,
  },
  name: {
    header: 'Name', // custom column header label
    valueGetter: ({ data }) => `${data.firstName} ${data.lastName}`,
    renderSortIcon: () => {
      const { columnSortInfo } = useInfiniteHeaderCell(); // eslint-disable-line
      if (!columnSortInfo) {
        return ' 🤷‍♂️';
      }
      return columnSortInfo.dir === 1 ? '▲' : '▼';
    },
  },
};

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const domProps = {
  style: {
    minHeight: 300,
  },
};
export default function App() {
  return (
    <DataSource<Developer> primaryKey="id" data={dataSource}>
      <InfiniteTable<Developer> domProps={domProps} columns={columns} />
    </DataSource>
  );
}

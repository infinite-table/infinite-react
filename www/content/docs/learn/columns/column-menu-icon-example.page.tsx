import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

import * as React from 'react';

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    defaultWidth: 80,
    renderMenuIcon: false,
  },

  name: {
    header: 'Name', // custom column header label
    valueGetter: ({ data }) => `${data.firstName} ${data.lastName}`,

    // custom menu icon
    renderMenuIcon: () => <div>🌎</div>,
  },
  age: {
    field: 'age',
    header: 'Age',
    renderMenuIcon: ({ column }) => {
      return `🔧 ${column.id}`;
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

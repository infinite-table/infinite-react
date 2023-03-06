import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

import styles from './coloring.module.css';

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    defaultWidth: 80,
  },

  name: {
    field: 'firstName',
    header: 'Name',
    className: styles.redColor,
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

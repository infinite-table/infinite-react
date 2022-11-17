import {
  InfiniteTable,
  DataSource,
  DataSourceGroupBy,
  InfiniteTablePropGroupColumn,
} from '@infinite-table/infinite-react';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';
import * as React from 'react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 80 },
  stack: {
    field: 'stack',
    renderValue: ({ data, rowInfo }) => {
      if (rowInfo.isGroupRow) {
        return <>{rowInfo.value} stuff</>;
      }

      return <b>🎇 {data?.stack}</b>;
    },
  },
  firstName: {
    field: 'firstName',
  },

  preferredLanguage: { field: 'preferredLanguage' },
};

const defaultGroupBy: DataSourceGroupBy<Developer>[] = [{ field: 'stack' }];

const groupColumn: InfiniteTablePropGroupColumn<Developer> = {
  defaultWidth: 250,

  renderValue: ({ rowInfo }) => {
    if (rowInfo.isGroupRow) {
      return (
        <>
          Grouped by <b>{rowInfo.value}</b>
        </>
      );
    }
  },
};

export default function ColumnValueGetterExample() {
  return (
    <>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        defaultGroupBy={defaultGroupBy}
      >
        <InfiniteTable<Developer>
          groupColumn={groupColumn}
          columns={columns}
          columnDefaultWidth={200}
        />
      </DataSource>
    </>
  );
}

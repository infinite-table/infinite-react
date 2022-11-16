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
  },
  firstName: {
    field: 'firstName',
  },
  preferredLanguage: { field: 'preferredLanguage' },
};

const defaultGroupBy: DataSourceGroupBy<Developer>[] = [{ field: 'stack' }];

const groupColumn: InfiniteTablePropGroupColumn<Developer> = {
  defaultWidth: 250,
  render: ({ rowInfo, toggleCurrentGroupRow }) => {
    if (rowInfo.isGroupRow) {
      const { collapsed } = rowInfo;
      const expandIcon = (
        <svg
          style={{
            display: 'inline-block',
            fill: collapsed ? '#b00000' : 'blue',
          }}
          width="20px"
          height="20px"
          viewBox="0 0 24 24"
          fill="#000000"
        >
          {collapsed ? (
            <>
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path d="M12 5.83L15.17 9l1.41-1.41L12 3 7.41 7.59 8.83 9 12 5.83zm0 12.34L8.83 15l-1.41 1.41L12 21l4.59-4.59L15.17 15 12 18.17z" />
            </>
          ) : (
            <path d="M7.41 18.59L8.83 20 12 16.83 15.17 20l1.41-1.41L12 14l-4.59 4.59zm9.18-13.18L15.17 4 12 7.17 8.83 4 7.41 5.41 12 10l4.59-4.59z" />
          )}
        </svg>
      );
      return (
        <div
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: collapsed ? '#b00000' : 'blue',
          }}
          onClick={() => toggleCurrentGroupRow()}
        >
          <i style={{ marginRight: 5 }}>Grouped by</i> <b>{rowInfo.value}</b>
          {expandIcon}
        </div>
      );
    }
  },
};

export default function ColumnCustomRenderExample() {
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

import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  RowSelectionState,
} from '@infinite-table/infinite-react';
import type {
  InfiniteTablePropColumns,
  DataSourceData,
  DataSourcePropGroupBy,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  preferredLanguage: string;
  stack: string;
};

const dataSource: DataSourceData<Developer> = ({ groupBy, groupKeys = [] }) => {
  const args = [
    `groupKeys=${JSON.stringify(groupKeys)}`,
    groupBy
      ? 'groupBy=' + JSON.stringify(groupBy.map((p) => ({ field: p.field })))
      : null,
  ]
    .filter(Boolean)
    .join('&');
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL + `/developers100-sql?` + args,
  ).then((r) => r.json());
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
};

const groupBy: DataSourcePropGroupBy<Developer> = [{ field: 'stack' }];

const domProps = {
  style: { height: '80vh' },
};

export default function App() {
  return (
    <DataSource<Developer>
      primaryKey="id"
      data={dataSource}
      groupBy={groupBy}
      lazyLoad
      selectionMode="multi-row"
      useGroupKeysForMultiRowSelection
      onRowSelectionChange={(rowSelection) => {
        (globalThis as any).rowSelection =
          rowSelection instanceof RowSelectionState
            ? rowSelection.getState()
            : rowSelection;
      }}
    >
      <InfiniteTable<Developer>
        domProps={domProps}
        columns={columns}
        groupRenderStrategy="single-column"
        multiRowSelectionWith="click"
        columnDefaultWidth={200}
      />
    </DataSource>
  );
}

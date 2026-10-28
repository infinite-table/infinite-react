import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourcePropMultiRowSelectionTarget,
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

(globalThis as any).dataParamsCalls = [];

const dataSource: DataSourceData<Developer> = ({
  groupBy,
  groupKeys = [],
  multiRowSelectionTarget,
}) => {
  (globalThis as any).dataParamsCalls.push({
    groupKeys,
    multiRowSelectionTarget,
  });
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
  stack: { field: 'stack' },
};

const groupBy: DataSourcePropGroupBy<Developer> = [
  { field: 'stack' },
  { field: 'preferredLanguage' },
];

const domProps = {
  style: { height: '80vh' },
};

export default function App() {
  const [target, setTarget] =
    React.useState<DataSourcePropMultiRowSelectionTarget>('visible');

  (globalThis as any).setTarget = setTarget;

  return (
    <DataSource<Developer>
      primaryKey="id"
      data={dataSource}
      groupBy={groupBy}
      lazyLoad
      selectionMode="multi-row"
      useGroupKeysForMultiRowSelection
      multiRowSelectionTarget={target}
    >
      <InfiniteTable<Developer>
        domProps={domProps}
        columns={columns}
        groupRenderStrategy="single-column"
        columnDefaultWidth={200}
      />
    </DataSource>
  );
}

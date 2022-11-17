import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';
import type {
  InfiniteTablePropColumns,
  InfiniteTablePropGroupColumn,
  DataSourceData,
  DataSourcePropRowSelection_MultiRow,
  DataSourcePropGroupBy,
} from '@infinite-table/infinite-react';
import * as React from 'react';
import { useState } from 'react';

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

const dataSource: DataSourceData<Developer> = ({
  pivotBy,
  aggregationReducers,
  groupBy,

  groupKeys = [],
}) => {
  const args = [
    pivotBy
      ? 'pivotBy=' + JSON.stringify(pivotBy.map((p) => ({ field: p.field })))
      : null,
    `groupKeys=${JSON.stringify(groupKeys)}`,
    groupBy
      ? 'groupBy=' + JSON.stringify(groupBy.map((p) => ({ field: p.field })))
      : null,
    aggregationReducers
      ? 'reducers=' +
        JSON.stringify(
          Object.keys(aggregationReducers).map((key) => ({
            field: aggregationReducers[key].field,
            id: key,
            name: aggregationReducers[key].reducer,
          })),
        )
      : null,
  ]
    .filter(Boolean)
    .join('&');
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers100-sql?` + args)
    .then((r) => r.json())
    .then((data: Developer[]) => data)
    .then((data) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(data);
        }, 100);
      });
    });
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },

  firstName: {
    field: 'firstName',
  },

  preferredLanguage: {
    field: 'preferredLanguage',
  },
  stack: {
    field: 'stack',
  },
};

const domProps = {
  style: {
    height: '80vh',
  },
};

const groupBy: DataSourcePropGroupBy<Developer> = [
  { field: 'stack' },
  {
    field: 'preferredLanguage',
  },
  {
    field: 'canDesign',
  },
];

const groupColumn: InfiniteTablePropGroupColumn<Developer> = {
  field: 'firstName',
  defaultWidth: 250,
};

export default function GroupByExample() {
  const [rowSelection] = useState<DataSourcePropRowSelection_MultiRow>({
    defaultSelection: false,
    selectedRows: [
      ['backend', 'Java'],
      ['backend', 'JavaScript'],
      ['backend', 'CSharp', 'no', 37],
      ['backend', 'PHP', 'no', 66],
      ['frontend'],
    ],
  });

  return (
    <DataSource<Developer>
      primaryKey="id"
      data={dataSource}
      groupBy={groupBy}
      lazyLoad
      selectionMode="multi-row"
      defaultRowSelection={rowSelection}
      useGroupKeysForMultiRowSelection
    >
      <InfiniteTable<Developer>
        domProps={domProps}
        columns={columns}
        keyboardNavigation="row"
        groupRenderStrategy="single-column"
        groupColumn={groupColumn}
        columnDefaultWidth={200}
      />
    </DataSource>
  );
}

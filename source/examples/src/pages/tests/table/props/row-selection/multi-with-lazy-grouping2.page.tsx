import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourcePropRowSelection_MultiRow,
  DataSourcePropGroupBy,
  InfiniteTablePropGroupColumn,
  DataSourceData,
  GroupRowsState,
} from '@infinite-table/infinite-react';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';

import { useState } from 'react';
import { RowSelectionState } from '@infinite-table/infinite-react';
import { components } from '@infinite-table/infinite-react';

const { CheckBox } = components;

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
};

const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});
export default function GroupByExample() {
  const [rowSelection] = useState<DataSourcePropRowSelection_MultiRow>({
    defaultSelection: false,
    selectedRows: [
      ['backend', 'Java'],
      ['backend', 'JavaScript'],
      ['backend', 'CSharp', 'no', 37],
      ['frontend'],
    ],
  });

  return (
    <>
      <div>
        <CheckBox checked={null}></CheckBox>test Selected{' '}
        {rowSelection instanceof RowSelectionState
          ? rowSelection.getSelectedCount()
          : false}
      </div>

      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        groupBy={groupBy}
        lazyLoad
        defaultGroupRowsState={groupRowsState}
        selectionMode="multi-row"
        defaultRowSelection={rowSelection}
        useGroupKeysForMultiRowSelection
      >
        <InfiniteTable<Developer>
          domProps={domProps}
          columns={columns}
          keyboardNavigation="row"
          groupRenderStrategy="single-column"
          hideColumnWhenGrouped
          groupColumn={groupColumn}
          columnDefaultWidth={300}
        />
      </DataSource>
    </>
  );
}

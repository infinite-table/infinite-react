<script setup lang="ts">
import {
  DataSource,
  InfiniteTable,
  RowSelectionState,
} from '@infinite-table/infinite-vue';
import type {
  InfiniteTablePropColumns,
  InfiniteTablePropGroupColumn,
  DataSourceData,
  DataSourcePropRowSelection_MultiRow,
  DataSourcePropGroupBy,
} from '@infinite-table/infinite-vue';

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
  stack: { field: 'stack' },
};

const groupBy: DataSourcePropGroupBy<Developer> = [
  { field: 'stack' },
  { field: 'preferredLanguage' },
  { field: 'canDesign' },
];

const groupColumn: InfiniteTablePropGroupColumn<Developer> = {
  field: 'firstName',
  defaultWidth: 250,
};

const defaultRowSelection: DataSourcePropRowSelection_MultiRow = {
  defaultSelection: false,
  selectedRows: [
    ['backend', 'Java'],
    ['backend', 'JavaScript'],
    ['backend', 'CSharp', 'no', 37],
    ['backend', 'PHP', 'no', 66],
    ['frontend'],
  ],
};

const domProps = {
  style: { height: '80vh' },
};

const onRowSelectionChange = (rowSelection: any) => {
  (globalThis as any).rowSelection =
    rowSelection instanceof RowSelectionState
      ? rowSelection.getState()
      : rowSelection;
};
</script>

<template>
  <DataSource
    primaryKey="id"
    :data="dataSource"
    :groupBy="groupBy"
    :lazyLoad="true"
    selectionMode="multi-row"
    :defaultRowSelection="defaultRowSelection"
    :useGroupKeysForMultiRowSelection="true"
    :onRowSelectionChange="onRowSelectionChange"
  >
    <InfiniteTable
      :domProps="domProps"
      :columns="columns"
      groupRenderStrategy="single-column"
      :groupColumn="groupColumn"
      :columnDefaultWidth="200"
    />
  </DataSource>
</template>

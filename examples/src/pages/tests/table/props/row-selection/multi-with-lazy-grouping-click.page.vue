<script setup lang="ts">
import {
  DataSource,
  InfiniteTable,
  RowSelectionState,
} from '@infinite-table/infinite-vue';
import type {
  InfiniteTablePropColumns,
  DataSourceData,
  DataSourcePropGroupBy,
} from '@infinite-table/infinite-vue';

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
    :useGroupKeysForMultiRowSelection="true"
    :onRowSelectionChange="onRowSelectionChange"
  >
    <InfiniteTable
      :domProps="domProps"
      :columns="columns"
      groupRenderStrategy="single-column"
      multiRowSelectionWith="click"
      :columnDefaultWidth="200"
    />
  </DataSource>
</template>

<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import type {
  DataSourcePropAggregationReducers,
  InfiniteTableColumnAggregator,
  InfiniteTablePropColumns,
  DataSourceGroupBy,
  DataSourcePivotBy,
} from '@infinite-table/infinite-vue';

import { data } from './pivot-sorting-example-data';
import type { WebFramework } from './pivot-sorting-example-data';

const columns: InfiniteTablePropColumns<WebFramework> = {
  id: { field: 'id' },
  name: { field: 'name' },
  language: { field: 'language' },
  license: { field: 'license' },
};

const countReducer: InfiniteTableColumnAggregator<WebFramework, any> = {
  initialValue: 0,
  reducer: (acc) => acc + 1,
};

const sumReducer: InfiniteTableColumnAggregator<WebFramework, any> = {
  initialValue: 0,
  reducer: (acc, value) => acc + value,
};

const reducers: DataSourcePropAggregationReducers<WebFramework> = {
  stargazers_count: {
    ...sumReducer,
    name: 'Stargarzers (sum)',
    field: 'stargazers_count',
  },
  license: {
    ...countReducer,
    name: 'License (count)',
    field: 'license',
  },
};
const groupBy: DataSourceGroupBy<WebFramework>[] = [
  { field: 'language' },
  { field: 'license' },
];
const pivotBy: DataSourcePivotBy<WebFramework>[] = [
  {
    field: 'license',
    column: ({ column }) => ({
      defaultSortable: !column.pivotTotalColumn,
    }),
  },
];

const defaultSortInfo = [{ id: 'group-by', dir: 1 as const }];

const domProps = {
  style: {
    height: '80vh',
  },
};
</script>

<template>
  <DataSource
    primaryKey="id"
    :data="data"
    :groupBy="groupBy"
    :pivotBy="pivotBy"
    :aggregationReducers="reducers"
    :defaultSortInfo="defaultSortInfo"
  >
    <template #default="{ pivotColumns, pivotColumnGroups }">
      <InfiniteTable
        :domProps="domProps"
        :columns="columns"
        groupRenderStrategy="single-column"
        :hideEmptyGroupColumns="true"
        :pivotColumns="pivotColumns"
        :pivotColumnGroups="pivotColumnGroups"
      />
    </template>
  </DataSource>
</template>

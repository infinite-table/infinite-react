<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { data } from './pivot-grouping-example-data';

const columns: Record<string, any> = {
  id: { field: 'id' },
  name: { field: 'name' },
  language: { field: 'language' },
  license: { field: 'license' },
};

const countReducer = {
  initialValue: 0,
  reducer: (acc: number) => acc + 1,
};

const sumReducer = {
  initialValue: 0,
  reducer: (acc: number, value: number) => acc + value,
};

const reducers = {
  stargazers_count: {
    ...sumReducer,
    name: 'Stargarzers (sum)',
    field: 'stargazers_count' as const,
  },
  license: {
    ...countReducer,
    name: 'License (count)',
    field: 'license' as const,
  },
};
const groupBy = [{ field: 'language' as const }, { field: 'license' as const }];
const pivotBy = [{ field: 'license' as const }];

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
  >
    <template #default="{ pivotColumns, pivotColumnGroups }">
      <InfiniteTable
        :domProps="domProps"
        :columns="columns"
        :hideEmptyGroupColumns="true"
        :pivotColumns="pivotColumns"
        :pivotColumnGroups="pivotColumnGroups"
      />
    </template>
  </DataSource>
</template>

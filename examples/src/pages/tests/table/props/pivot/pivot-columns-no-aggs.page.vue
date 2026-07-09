<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { data } from './pivot-grouping-example-data';

const columns: Record<string, any> = {
  id: { field: 'id' },
  name: { field: 'name' },
  language: { field: 'language' },
  license: { field: 'license' },
};

const groupBy = [{ field: 'language' as const }];
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

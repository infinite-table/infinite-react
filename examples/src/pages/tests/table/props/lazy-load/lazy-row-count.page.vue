<script setup lang="ts">
import { computed, ref } from 'vue';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import {
  getLazyRowCountDataSource,
  lazyRowCountColumns,
} from './lazy-row-count-server';

const dataSources = {
  withRootCount: getLazyRowCountDataSource(true),
  withoutRootCount: getLazyRowCountDataSource(false),
};

const domProps = {
  style: { height: '80vh' },
};

const withRootCount = ref(true);
const grouped = ref(true);

const data = computed(
  () => dataSources[withRootCount.value ? 'withRootCount' : 'withoutRootCount'],
);
const groupBy = computed(() => (grouped.value ? [{ field: 'stack' }] : []));

(globalThis as any).setWithRootCount = (value: boolean) => {
  withRootCount.value = value;
};
(globalThis as any).setGrouped = (value: boolean) => {
  grouped.value = value;
};
</script>

<template>
  <DataSource
    primaryKey="id"
    :data="data"
    :groupBy="groupBy"
    :lazyLoad="true"
  >
    <InfiniteTable
      :domProps="domProps"
      :columns="lazyRowCountColumns"
      groupRenderStrategy="single-column"
      :columnDefaultWidth="150"
    />
  </DataSource>
</template>

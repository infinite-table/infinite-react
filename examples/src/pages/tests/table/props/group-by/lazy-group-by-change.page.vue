<script setup lang="ts">
import { ref } from 'vue';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import {
  lazyUnfilteredColumns,
  lazyUnfilteredDataSource,
} from '../row-selection/lazyUnfilteredServer';

const domProps = {
  style: { height: '80vh' },
};

const groupBy = ref<{ field: 'stack' }[]>([]);

(globalThis as any).setGroupBy = (value: { field: 'stack' }[]) => {
  groupBy.value = value;
};
</script>

<template>
  <DataSource
    primaryKey="id"
    :data="lazyUnfilteredDataSource"
    :lazyLoad="true"
    :groupBy="groupBy"
  >
    <InfiniteTable
      :domProps="domProps"
      :columns="lazyUnfilteredColumns"
      :columnDefaultWidth="150"
    />
  </DataSource>
</template>

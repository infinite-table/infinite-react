<script setup lang="ts">
import { ref } from 'vue';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import {
  lazyUnfilteredColumns,
  lazyUnfilteredDataSource,
  lazyUnfilteredFilterValue,
} from './lazyUnfilteredServer';

const domProps = {
  style: { height: '80vh' },
};

const target = ref<'all' | 'visible'>('all');

(globalThis as any).setTarget = (value: 'all' | 'visible') => {
  target.value = value;
};
</script>

<template>
  <DataSource
    primaryKey="id"
    :data="lazyUnfilteredDataSource"
    :lazyLoad="true"
    :defaultFilterValue="lazyUnfilteredFilterValue"
    selectionMode="multi-row"
    :multiRowSelectionTarget="target"
  >
    <InfiniteTable
      :domProps="domProps"
      :columns="lazyUnfilteredColumns"
      :columnDefaultWidth="150"
    />
  </DataSource>
</template>

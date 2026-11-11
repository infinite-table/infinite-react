<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-vue';

import {
  COLUMN_WIDTH,
  makeRows,
  ROW_HEIGHT,
  HORIZONTAL_LAYOUT_ROW_COUNT,
} from './largeContentData';
import type { LargeContentRow } from './largeContentData';

const columns: InfiniteTablePropColumns<LargeContentRow> = {
  id: { field: 'id', type: 'number' },
  name: { field: 'name' },
  value: { field: 'value', type: 'number' },
  code: { field: 'code' },
  group: { field: 'group' },
};

const domProps = { style: { height: '600px', width: '800px' } };

const rowCount = ref(HORIZONTAL_LAYOUT_ROW_COUNT);
const data = computed(() => makeRows(rowCount.value));

onMounted(() => {
  (globalThis as any).setRowCount = (count: number) => {
    rowCount.value = count;
  };
});
</script>

<template>
  <DataSource primaryKey="id" :data="data">
    <InfiniteTable
      :columns="columns"
      :rowHeight="ROW_HEIGHT"
      :columnDefaultWidth="COLUMN_WIDTH"
      :domProps="domProps"
      :wrapRowsHorizontally="true"
    />
  </DataSource>
</template>

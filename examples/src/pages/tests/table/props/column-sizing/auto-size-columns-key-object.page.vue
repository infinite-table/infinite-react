<script setup lang="ts">
import { computed, ref } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type {
  InfiniteTablePropColumns,
  InfiniteTablePropColumnSizing,
} from '@infinite-table/infinite-vue';

type Item = {
  id: number;
  name: string;
};

const data: Item[] = Array.from({ length: 500 }, (_, id) => ({
  id,
  name: `Item ${id}`,
}));

const columns: InfiniteTablePropColumns<Item> = {
  id: { field: 'id' },
  name: { field: 'name' },
};

const domProps = {
  style: {
    height: '60vh',
  },
};

const key = ref(0);
const columnSizing = ref<InfiniteTablePropColumnSizing>({});

const autoSizeColumnsKey = computed(() =>
  key.value
    ? { key: key.value, columnsToResize: ['id'], includeHeader: false }
    : undefined,
);

const onColumnSizingChange = (sizing: InfiniteTablePropColumnSizing) => {
  columnSizing.value = sizing;
};

const setWidth = () => {
  columnSizing.value = { ...columnSizing.value, id: { width: 300 } };
};
</script>

<template>
  <button data-name="auto-size" @click="key++">Auto size</button>
  <button data-name="set-width" @click="setWidth">Set width</button>
  <DataSource :data="data" primaryKey="id">
    <InfiniteTable
      :rowHeight="40"
      :columnDefaultWidth="200"
      :columnMinWidth="20"
      :columnSizing="columnSizing"
      :onColumnSizingChange="onColumnSizingChange"
      :autoSizeColumnsKey="autoSizeColumnsKey"
      :domProps="domProps"
      :columns="columns"
    />
  </DataSource>
</template>

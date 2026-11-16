<script setup lang="ts">
import { ref } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-vue';

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

const scrollTopKey = ref(0);
</script>

<template>
  <button data-name="scroll-to-top" @click="scrollTopKey++">
    Scroll to top
  </button>
  <DataSource :data="data" primaryKey="id">
    <InfiniteTable
      :rowHeight="40"
      :scrollTopKey="scrollTopKey"
      :domProps="domProps"
      :columns="columns"
    />
  </DataSource>
</template>

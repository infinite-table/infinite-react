<script setup lang="ts">
import { ref } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-vue';

type Item = {
  id: number;
  name: string;
};

const data: Item[] = Array.from({ length: 100 }, (_, id) => ({
  id,
  name: `Item ${id}`,
}));

const columns: InfiniteTablePropColumns<Item> = {
  id: { field: 'id' },
  name: { field: 'name' },
};

const densities = ['compact', 'comfortable', 'spacious'] as const;

const domProps = {
  style: {
    height: '60vh',
  },
};

const density = ref<(typeof densities)[number]>('comfortable');
</script>

<template>
  <div :class="`infinite-density--${density}`">
    <button
      v-for="value in densities"
      :key="value"
      :data-name="`density-${value}`"
      @click="density = value"
    >
      {{ value }}
    </button>
    <DataSource :data="data" primaryKey="id">
      <!-- no rowHeight: the density drives it -->
      <InfiniteTable :domProps="domProps" :columns="columns" />
    </DataSource>
  </div>
</template>

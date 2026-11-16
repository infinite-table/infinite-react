<script setup lang="ts">
import '@infinite-table/infinite-vue/index.css';
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import { computed, ref } from 'vue';

import { columns } from './columns.vue';
import type { Employee } from './columns.vue';

const getDataSourceFor = (size: string) => {
  if (size === '0') {
    return () => Promise.resolve([]);
  }
  return () => {
    return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees' + size)
      .then((r) => r.json())
      .then((data: Employee[]) => data);
  };
};

const dataSourceSize = ref<string>('10');

const dataSource = computed(() => {
  return getDataSourceFor(dataSourceSize.value);
});
</script>

<template>
  <div
    :style="{
      display: 'flex',
      flex: 1,
      color: 'var(--infinite-cell-color)',
      flexFlow: 'column',
      background: 'var(--infinite-background)',
    }"
  >
    <p :style="{ padding: '10px' }">Please select the size of the datasource:</p>
    <div :style="{ padding: '10px' }">
      <select
        v-model="dataSourceSize"
        :style="{
          margin: '10px 0',
          display: 'inline-block',
          background: 'var(--infinite-background)',
          color: 'currentColor',
          padding: 'var(--infinite-space-3)',
        }"
      >
        <option value="0">no items</option>
        <option value="10">10 items</option>
        <option value="100">100 items</option>
        <option value="1k">1k items</option>
        <option value="10k">10k items</option>
      </select>
    </div>
    <DataSource :data="dataSource" primaryKey="id">
      <InfiniteTable
        debugId="refetch-example"
        :columns="columns"
        :columnDefaultWidth="150"
      />
    </DataSource>
  </div>
</template>

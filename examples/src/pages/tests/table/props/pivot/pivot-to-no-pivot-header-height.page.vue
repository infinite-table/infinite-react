<script setup lang="ts">
import { ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { columns } from './from-pivot-to-normal-data';
import { data } from './pivot-grouping-example-data';

const dataSource = () => {
  return Promise.resolve(data);
};

const domProps = {
  style: {
    height: '80vh',
  },
};

const groupBy = [{ field: 'license' }];
const pivotBy = [{ field: 'language' }];
const aggregationReducers = {
  stargazers_count: {
    initialValue: 0,
    field: 'stargazers_count',
    reducer: (acc: number, value: number) => acc + value,
  },
  license_count: {
    initialValue: 0,
    field: 'license',
    reducer: (acc: number) => acc + 1,
  },
};

// The same <InfiniteTable /> instance goes in and out of pivot mode, and it
// has no `columnGroups` of its own - so when it's not pivoting,
// `pivotColumnGroups` is undefined.
const view = ref<'flat' | 'grouped' | 'pivot'>('flat');

const wrapperStyle = {
  display: 'flex',
  flex: 1,
  color: 'var(--infinite-cell-color)',
  flexFlow: 'column',
  background: 'var(--infinite-background)',
};
</script>

<template>
  <div :style="wrapperStyle">
    <div style="padding: 10px">
      <button @click="view = 'flat'">Flat</button>
      <button @click="view = 'grouped'">Grouped</button>
      <button @click="view = 'pivot'">Pivot</button>
    </div>
    <DataSource
      primaryKey="id"
      :data="dataSource"
      :groupBy="view === 'flat' ? undefined : groupBy"
      :pivotBy="view === 'pivot' ? pivotBy : undefined"
      :aggregationReducers="view === 'pivot' ? aggregationReducers : undefined"
    >
      <template #default="{ pivotColumns, pivotColumnGroups }">
        <InfiniteTable
          :domProps="domProps"
          :columns="columns"
          :pivotColumns="pivotColumns"
          :pivotColumnGroups="pivotColumnGroups"
          :columnHeaderHeight="40"
          :columnDefaultWidth="150"
        />
      </template>
    </DataSource>
  </div>
</template>

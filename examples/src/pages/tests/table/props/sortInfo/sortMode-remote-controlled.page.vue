<script setup lang="ts">
import { ref } from 'vue';

import { CarSale } from '@examples/datasets/CarSale';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { carsales } from './common';

const columns: Record<string, any> = {
  make: { field: 'make' },
  model: { field: 'model' },

  category: {
    field: 'category',
  },
  sales: {
    field: 'sales',
    sortType: 'number',
  },
  year: {
    field: 'year',
    sortType: 'number',
  },
};

const domProps = {
  style: {
    margin: '5px',
    height: '900px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

const dataSource = ({ sortInfo }: { sortInfo?: any }) => {
  console.log('sortInfo', sortInfo);
  console.log('refetch data');
  (globalThis as any).sortInfo = sortInfo;
  (globalThis as any).callCount = ((globalThis as any).callCount || 0) + 1;
  return Promise.resolve(carsales);
};

const shouldReloadData = {
  sortInfo: true,
};

const sortInfo = ref<any>([]);

const onSortInfoChange = (newSortInfo: any) => {
  sortInfo.value = newSortInfo;
};
</script>

<template>
  <DataSource
    :data="dataSource"
    primaryKey="id"
    :shouldReloadData="shouldReloadData"
    :onSortInfoChange="onSortInfoChange"
    :sortInfo="sortInfo"
  >
    <InfiniteTable :domProps="domProps" :columns="columns" />
  </DataSource>
</template>

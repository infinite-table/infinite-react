<script setup lang="ts">
import { ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { carsales, columns, groupByCarsalesDomProps } from './common';

const dataSource = (params: any) => {
  console.log('refetch data');

  (globalThis as any).callCount = ((globalThis as any).callCount || 0) + 1;
  (globalThis as any).groupBy = params.groupBy;
  return Promise.resolve(carsales);
};

const groupBy = ref<any[]>([
  {
    field: 'year',
  },
]);

const toggleGroup = () => {
  if (groupBy.value.length) {
    groupBy.value = [];
  } else {
    groupBy.value = [
      {
        field: 'year',
      },
    ];
  }
};
</script>

<template>
  <button @click="toggleGroup">toggle group</button>
  <DataSource :data="dataSource" primaryKey="id" :groupBy="groupBy">
    <InfiniteTable :domProps="groupByCarsalesDomProps" :columns="columns" />
  </DataSource>
</template>

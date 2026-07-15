<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { data } from './rowinfo-with-grouping-data';

const dataSource = () => {
  return Promise.resolve(data);
};

const columns: Record<string, any> = {
  firstName: {
    field: 'firstName',
    header: 'First Name',
    render: ({ value, rowInfo }: { value: any; rowInfo: any }) => {
      return `${value} ${rowInfo.indexInAll}!`;
    },
  },
};
const groupBy = [
  {
    field: 'country' as const,
  },
  { field: 'city' as const },
];

const domProps = {
  style: {
    margin: '5px',
    height: '900px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

const setDataArray = (dataArray: any) => {
  (globalThis as any).dataArray = dataArray;
  return '';
};
</script>

<template>
  <DataSource :data="dataSource" primaryKey="id" :groupBy="groupBy">
    <template v-slot="{ dataArray }">
      {{ setDataArray(dataArray) }}
      <InfiniteTable
        :domProps="domProps"
        groupRenderStrategy="single-column"
        :columnDefaultWidth="300"
        :columns="columns"
      />
    </template>
  </DataSource>
</template>

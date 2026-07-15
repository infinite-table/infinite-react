<script setup lang="ts">
import { ref } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type { DataSourceDataParams } from '@infinite-table/infinite-vue';

import { columns, data, type Developer } from './common';

//@ts-ignore
globalThis.dataSourceCalls = 0;

const refetchKey = ref(1);

const dataSource = ({ refetchKey }: DataSourceDataParams<Developer>) => {
  //@ts-ignore
  globalThis.dataSourceCalls += 1;
  return refetchKey && (refetchKey as number) % 2 === 0
    ? data.slice(0, 2)
    : data.slice(0, data.length);
};

const domProps = {
  style: {
    margin: '5px',
    height: '500px',
    width: '1000px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};
</script>

<template>
  <button @click="refetchKey = refetchKey + 1">refetch</button>
  <DataSource :refetchKey="refetchKey" :data="dataSource" primaryKey="id">
    <InfiniteTable :domProps="domProps" :columns="columns" />
  </DataSource>
</template>

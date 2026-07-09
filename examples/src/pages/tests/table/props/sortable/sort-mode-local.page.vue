<script setup lang="ts">
import { ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { columns, data, minHeight500DomProps } from './common';

//@ts-ignore
globalThis.dataSourceCalls = 0;

const refetchKey = ref(1);

const dataSource = ({ refetchKey }: { refetchKey?: number | string }) => {
  //@ts-ignore
  globalThis.dataSourceCalls += 1;
  console.log('refetchKey', refetchKey);
  return Promise.resolve(
    refetchKey && (refetchKey as number) % 2 === 0
      ? data.slice(0, 2)
      : data.slice(0, data.length),
  );
};

const refetch = () => {
  refetchKey.value += 1;
};

const shouldReloadData = {
  sortInfo: false,
};
</script>

<template>
  <button @click="refetch">refetch</button>
  <DataSource
    :refetchKey="refetchKey"
    :data="dataSource"
    primaryKey="id"
    :shouldReloadData="shouldReloadData"
  >
    <InfiniteTable :columns="columns" :domProps="minHeight500DomProps" />
  </DataSource>
</template>

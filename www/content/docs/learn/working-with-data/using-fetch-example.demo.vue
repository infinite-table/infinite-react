<script setup lang="ts">
import '@infinite-table/infinite-vue/index.css';
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import { columns } from './columns.vue';
import type { Employee } from './columns.vue';

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees10k')
    .then((r) => r.json())
    .then((data: Employee[]) => {
      return data;
    });
};
</script>

<template>
  <DataSource :data="dataSource" primaryKey="id">
    <InfiniteTable debugId="using-fetch-example" :columns="columns" />
  </DataSource>
</template>

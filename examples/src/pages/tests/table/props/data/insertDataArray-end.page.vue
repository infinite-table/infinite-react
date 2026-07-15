<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import type { DataSourceApi } from '@infinite-table/infinite-vue';

import {
  type Developer,
  insertData as data,
  insertDataColumns as columns,
  mark,
  afterMark,
  height100DomProps,
} from './common';

(globalThis as any).mutations = undefined;

let dataSourceApi: DataSourceApi<Developer> | null = null;

const onReady = (api: DataSourceApi<Developer>) => {
  dataSourceApi = api;
};

const onAddClick = () => {
  dataSourceApi!.insertDataArray([mark, afterMark], {
    position: 'end',
  });
};


</script>

<template>
  <button @click="onAddClick">Add 2 items</button>

  <DataSource :data="data" primaryKey="id" :onReady="onReady">
    <InfiniteTable
      :domProps="height100DomProps"
      :columnDefaultWidth="100"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>

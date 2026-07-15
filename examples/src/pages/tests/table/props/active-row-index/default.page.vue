<script setup lang="ts">
import { ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import type { InfiniteTableApi } from '@infinite-table/infinite-vue';

import {
  activeRowDomProps,
  defaultColumns,
  developers100DataSource,
  type Developer,
} from './common';

const infiniteTableApi = ref<InfiniteTableApi<Developer> | null>(null);

const onReady = ({ api }: { api: InfiniteTableApi<Developer> }) => {
  infiniteTableApi.value = api;
};

const scrollLeft = () => {
  infiniteTableApi.value!.scrollLeft = 100;
};

const columnPinning = {
  stack: true,
};
</script>

<template>
  <button @click="scrollLeft">scroll left = 100</button>
  <DataSource primaryKey="id" :data="developers100DataSource">
    <InfiniteTable
      :onReady="onReady"
      :columns="defaultColumns"
      :defaultActiveRowIndex="99"
      keyboardNavigation="row"
      :domProps="activeRowDomProps"
      :columnPinning="columnPinning"
    />
  </DataSource>
</template>

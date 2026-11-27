<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import {
  DataKind,
  columns,
  createDataChangeLog,
  domProps,
} from './data-change-callbacks.log';

const { handlers, data } = createDataChangeLog();

const kinds: DataKind[] = ['array', 'promise', 'fn'];
</script>

<template>
  <DataSource
    v-for="kind in kinds"
    :key="kind"
    :data="data[kind]"
    primaryKey="id"
    :onDataArrayChange="handlers[kind].onDataArrayChange"
    :onDataMutations="handlers[kind].onDataMutations"
    :onReady="handlers[kind].onReady"
  >
    <InfiniteTable :columns="columns" :domProps="domProps" />
  </DataSource>
</template>

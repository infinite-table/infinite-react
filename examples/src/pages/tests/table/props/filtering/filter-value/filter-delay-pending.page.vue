<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import {
  FILTER_DELAY,
  columns,
  developers,
  domProps,
  recordFilterValueChange,
} from './filter-delay-pending.data';
</script>

<template>
  <DataSource
    :data="developers"
    primaryKey="id"
    :defaultFilterValue="[]"
    :filterDelay="FILTER_DELAY"
    :onFilterValueChange="recordFilterValueChange"
  >
    <InfiniteTable
      :domProps="domProps"
      :columnDefaultWidth="200"
      :columns="columns"
    />
  </DataSource>
</template>

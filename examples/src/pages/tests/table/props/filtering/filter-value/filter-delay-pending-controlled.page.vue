<script setup lang="ts">
import { ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import type { DataSourceFilterValueItem } from '@infinite-table/infinite-vue';

import {
  Developer,
  FILTER_DELAY,
  columns,
  developers,
  domProps,
  recordFilterValueChange,
} from './filter-delay-pending.data';

const filterValue = ref<DataSourceFilterValueItem<Developer>[]>([]);

// a view or a restored state replacing the filters - called by the spec
(globalThis as any).setFilterValue = (
  value: DataSourceFilterValueItem<Developer>[],
) => {
  filterValue.value = value;
};

const onFilterValueChange = (value: DataSourceFilterValueItem<Developer>[]) => {
  recordFilterValueChange(value);
  filterValue.value = value;
};
</script>

<template>
  <DataSource
    :data="developers"
    primaryKey="id"
    :filterValue="filterValue"
    :onFilterValueChange="onFilterValueChange"
    :filterDelay="FILTER_DELAY"
  >
    <InfiniteTable
      :domProps="domProps"
      :columnDefaultWidth="200"
      :columns="columns"
    />
  </DataSource>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import {
  DataSource,
  InfiniteTable,
  multisort,
} from '@infinite-table/infinite-vue';
import type { DataSourceSingleSortInfo } from '@infinite-table/infinite-vue';

import { developers } from './developers';
import type { Developer } from './developers';

// the owner's own rule for sorting names: by length, not alphabetically
const byLength = (a: string, b: string) => a.length - b.length;

const sortInfo = ref<DataSourceSingleSortInfo<Developer>[]>([]);

const rows = computed(() =>
  multisort(
    sortInfo.value.map((info) => ({ ...info, fn: byLength })),
    [...developers],
  ),
);

const onSortInfoChange = (value: DataSourceSingleSortInfo<Developer>[]) => {
  sortInfo.value = value;
};

const columns = {
  name: { field: 'name' as const },
  country: { field: 'country' as const },
  age: { field: 'age' as const, type: 'number' },
};

const domProps = { style: { height: '80vh' } };
</script>

<template>
  <DataSource
    primaryKey="id"
    :data="rows"
    :sortInfo="sortInfo"
    :onSortInfoChange="onSortInfoChange"
  >
    <InfiniteTable :columns="columns" :domProps="domProps" />
  </DataSource>
</template>

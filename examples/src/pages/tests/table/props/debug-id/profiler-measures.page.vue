<script setup lang="ts">
import { ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import type { DataSourceApi } from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  salary: number;
};

const data: Developer[] = Array.from({ length: 20 }, (_, index) => ({
  id: index,
  firstName: `Dev ${index}`,
  salary: 1000 + index * 10,
}));

const columns: Record<string, any> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  salary: { field: 'salary', type: 'number' },
};

const defaultSortInfo = {
  field: 'salary',
  dir: -1,
};

const domProps = {
  style: {
    height: '80vh',
  },
};

// the same name the grid uses for one of its own profiler entries
const USER_MEASURE_NAME = 'Sort';

// a measure made by the app itself, that the grid has to leave alone
performance.measure(USER_MEASURE_NAME, { start: 0, end: 1 });

// With a `debugId`, the grid adds entries to the custom tracks of the
// Chrome DevTools profiler. Every data update makes a few of them.
const dataSourceApi = ref<DataSourceApi<Developer> | null>(null);
const updates = ref(0);

const onReady = ({
  dataSourceApi: api,
}: {
  dataSourceApi: DataSourceApi<Developer>;
}) => {
  dataSourceApi.value = api;
};

const update = () => {
  updates.value++;
  dataSourceApi.value?.updateData({
    id: updates.value % data.length,
    salary: 5000 + updates.value,
  });
};
</script>

<template>
  <button @click="update">update</button>
  <span data-name="updates">{{ updates }}</span>
  <DataSource
    :data="data"
    primaryKey="id"
    debugId="profiled"
    :defaultSortInfo="defaultSortInfo"
  >
    <InfiniteTable
      debugId="profiled"
      :onReady="onReady"
      :domProps="domProps"
      :columns="columns"
      :columnDefaultWidth="150"
    />
  </DataSource>
</template>

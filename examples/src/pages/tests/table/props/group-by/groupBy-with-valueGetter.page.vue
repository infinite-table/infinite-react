<script setup lang="ts">
import { computed, ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { data } from './people';
import type { Person } from './people';

const columns: Record<string, any> = {
  name: {
    field: 'name',
  },
  department: {
    field: 'department',
    style: {
      color: 'red',
    },
  },

  team: {
    field: 'team',
  },
};
const columnAggregations = {
  salary: {
    initialValue: 0,
    field: 'salary' as const,
    reducer: (acc: number, sum: number) => acc + sum,
    done: (sum: number, arr: any[]) => (arr.length ? sum / arr.length : 0),
  },
};

const useField = ref(true);
const useKnownGroupField = ref(false);

const groupBy = computed<any[]>(() => {
  if (useField.value) {
    return [
      {
        field: 'department',
      },
      { field: 'team' },
    ];
  }

  return [
    {
      groupField: useKnownGroupField.value ? 'department' : 'xxx',
      valueGetter: ({ data }: { data: Person }) =>
        `Department: ${data.department}-${data.age}`,
    },
    { field: 'team' },
  ];
});

const slicedData = data.slice(0, 5);

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};
</script>

<template>
  <label :style="{ color: 'magenta' }">
    Use field in groupBy
    <input
      type="checkbox"
      :checked="useField"
      @change="useField = !useField"
    />
  </label>

  <label :style="{ color: 'magenta' }">
    Use known group field in groupBy
    <input
      type="checkbox"
      :checked="useKnownGroupField"
      @change="useKnownGroupField = !useKnownGroupField"
    />
  </label>
  <DataSource
    :data="slicedData"
    primaryKey="id"
    :groupBy="groupBy"
    :aggregationReducers="columnAggregations"
  >
    <InfiniteTable
      :domProps="domProps"
      :columnDefaultWidth="250"
      :columns="columns"
    />
  </DataSource>
</template>

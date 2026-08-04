<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { data } from './people';

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
  team: {
    initialValue: 0,
    field: 'team' as const,
    reducer: (acc: number) => acc + 1,
  },
  department: {
    initialValue: 0,
    field: 'department' as const,
    reducer: (acc: number) => acc + 1,
  },
};

const groupBy = [
  {
    field: 'department' as const,
  },
  { field: 'team' as const },
];

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

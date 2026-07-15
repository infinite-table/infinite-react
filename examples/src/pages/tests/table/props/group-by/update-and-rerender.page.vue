<script setup lang="ts">
import { h } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { data } from './people';
import type { Person } from './people';

const columns: Record<string, any> = {
  name: {
    field: 'name',
  },
  country: {
    field: 'country',
  },
  department: {
    field: 'department',
  },
  age: {
    field: 'age',
    type: 'number',
    defaultEditable: true,
    renderValue: ({ value }: { value: any }) => {
      return `${value}-${Date.now()}`;
    },
    header: () => {
      return h('div', `Age-${Date.now()}`);
    },
    getValueToPersist: ({ value }: { value: any }) => {
      return Number(value);
    },
  },
  salary: {
    field: 'salary',
    type: 'number',

    render: ({ value, rowInfo }: { value: any; rowInfo: any }) => {
      if (rowInfo.isGroupRow) {
        return h('span', [
          'Avg salary ',
          h('b', `${rowInfo.groupKeys?.join(', ')}`),
          ': ',
          h('b', `${rowInfo.reducerResults![0]}`),
        ]);
      }
      return `${value}`;
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
  age: {
    initialValue: 0,
    field: 'age' as const,
    reducer: (acc: number, sum: number) => acc + sum,
    done: (sum: number, arr: any[]) =>
      arr.length ? Math.round((sum / arr.length) * 100) / 100 : 0,
  },
};

const groupBy = [
  { field: 'department' as keyof Person },
  { field: 'team' as keyof Person },
];

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
    :data="data"
    primaryKey="id"
    :groupBy="groupBy"
    :aggregationReducers="columnAggregations"
  >
    <InfiniteTable
      :domProps="domProps"
      :columnDefaultWidth="150"
      :columns="columns"
    />
  </DataSource>
</template>

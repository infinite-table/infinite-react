<script setup lang="ts">
import { h } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { data } from './people';
import type { Person } from './people';

const columns: Record<string, any> = {
  name: {
    field: 'name',
    verticalAlign: 'end',
    defaultWidth: 200,
    align: () => {
      return 'end';
    },
    renderValue: ({ value }: { value: any }) => {
      return `${value}.`;
    },
  },
  country: {
    verticalAlign: ({ isHeader }: { isHeader: boolean }) =>
      isHeader ? 'end' : 'start',

    defaultWidth: 200,

    field: 'country',
    align: 'center',
    renderValue: ({ value }: { value: any }) => {
      return `${value}!`;
    },
  },
  department: {
    field: 'department',
    verticalAlign: ({ isHeader }: { isHeader: boolean }) =>
      isHeader ? 'start' : 'center',
  },
  age: {
    field: 'age',
    type: 'number',
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
};

const groupBy = [
  { field: 'department' as keyof Person },
  { field: 'team' as keyof Person },
];

const groupColumn = {
  field: 'department' as const,

  align: ({
    value,
    isGroupRow,
    isHeader,
  }: {
    value: any;
    isGroupRow: boolean;
    isHeader: boolean;
  }) => {
    if (isHeader) {
      return 'end';
    }
    if (isGroupRow) {
      return 'start';
    }
    return value === 'it' ? 'center' : 'end';
  },
  defaultWidth: 300,
};

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
      groupRenderStrategy="single-column"
      :groupColumn="groupColumn"
      :rowHeight="80"
      :columnHeaderHeight="80"
      :columnDefaultWidth="150"
      :columns="columns"
    />
  </DataSource>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import {
  DataSource,
  InfiniteTable,
  GroupRowsState,
} from '@infinite-table/infinite-vue';

const domProps = {
  style: {
    height: '80vh',
    width: '2000px',
  },
};
type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data)
    .then(
      (data) =>
        new Promise<Developer[]>((resolve) => {
          setTimeout(() => resolve(data), 1000);
        }),
    );
};

const avgSalaryReducer = {
  initialValue: 0,
  field: 'salary' as const,
  reducer: (acc: number, sum: number) => acc + sum,
  done: (sum: number, arr: any[]) => (arr.length ? sum / arr.length : 0),
};

const aggregationReducers = {
  salary: avgSalaryReducer,
};

const columns: Record<string, any> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
  country: { field: 'country' },
  canDesign: { field: 'canDesign' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  age: { field: 'age' },
  salary: { field: 'salary', type: 'number', style: { color: 'red' } },
  currency: { field: 'currency' },
};

const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

const groupBy = [
  {
    field: 'preferredLanguage' as const,
  },
  { field: 'stack' as const },
];

const pivotBy = [
  {
    field: 'country' as const,
  },
];

const pivot = ref(false);
</script>

<template>
  <button @click="pivot = !pivot">toggle pivot</button>
  <DataSource
    primaryKey="id"
    :data="dataSource"
    :groupBy="groupBy"
    :pivotBy="pivot ? pivotBy : undefined"
    :defaultGroupRowsState="groupRowsState"
    :aggregationReducers="aggregationReducers"
  >
    <template #default="{ pivotColumns, pivotColumnGroups }">
      <InfiniteTable
        :columns="columns"
        :domProps="domProps"
        :pivotColumns="pivotColumns"
        :pivotColumnGroups="pivotColumnGroups"
        :columnDefaultWidth="150"
        pivotTotalColumnPosition="start"
      />
    </template>
  </DataSource>
</template>

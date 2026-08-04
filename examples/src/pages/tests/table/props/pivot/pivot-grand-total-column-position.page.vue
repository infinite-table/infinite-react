<script setup lang="ts">
import { ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { developers } from './pivot-total-column-position-data';

const columns: Record<string, any> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
  country: { field: 'country' },
  canDesign: { field: 'canDesign' },
  hobby: { field: 'hobby' },
  city: {
    field: 'city',
  },
  age: {
    field: 'age',
    type: ['number'],
  },
  salary: {
    field: 'salary',
    type: ['number', 'currency'],
  },
  currency: { field: 'currency' },
};

const avgReducer = {
  initialValue: 0,
  reducer: (acc: number, sum: number) => acc + sum,
  done: (sum: number, arr: any[]) => (arr.length ? sum / arr.length : 0),
};

const reducers = {
  salary: {
    ...avgReducer,
    name: 'Salary (avg)',
    field: 'salary' as const,
  },
  age: {
    ...avgReducer,
    name: 'Age (avg)',
    field: 'age' as const,
  },
};
const groupBy = [{ field: 'country' as const }];
const pivotBy = [{ field: 'stack' as const }];

const domProps = {
  style: {
    height: '80vh',
  },
};

const position = ref<'start' | 'end' | false>(false);

const togglePosition = () => {
  const x = position.value;
  position.value = x === 'end' ? 'start' : x === 'start' ? false : 'end';
};
</script>

<template>
  <button @click="togglePosition">toggle grand totals - {{ `${position}` }}</button>

  <DataSource
    primaryKey="id"
    :data="developers"
    :groupBy="groupBy"
    :pivotBy="pivotBy"
    :aggregationReducers="reducers"
  >
    <template #default="{ pivotColumns, pivotColumnGroups }">
      <InfiniteTable
        :domProps="domProps"
        :columns="columns"
        :hideEmptyGroupColumns="true"
        :pivotColumns="pivotColumns"
        :pivotColumnGroups="pivotColumnGroups"
        :pivotGrandTotalColumnPosition="position"
      />
    </template>
  </DataSource>
</template>

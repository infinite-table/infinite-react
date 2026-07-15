<script setup lang="ts">
import { ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

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
  streetName: string;
  streetNo: number;
  streetPrefix: string;
};

const developers: Developer[] = [
  {
    id: 0,
    firstName: 'Nya',
    lastName: 'Klein',
    country: 'India',

    city: 'Unnao',
    streetName: 'Purdy Lane',
    streetPrefix: 'Landing',
    streetNo: 183,
    age: 24,
    currency: 'JPY',
    preferredLanguage: 'TypeScript',
    stack: 'backend',
    canDesign: 'yes',
    salary: 60000,
    hobby: 'sports',
  },
  {
    id: 1,
    firstName: 'Rob',
    lastName: 'Boston',
    country: 'USA',

    city: 'LA',
    streetName: 'Purdy Lane',
    streetPrefix: 'Landing',
    streetNo: 183,
    age: 24,
    currency: 'USD',
    preferredLanguage: 'TypeScript',
    stack: 'frontend',
    canDesign: 'no',
    salary: 10000,
    hobby: 'sports',
  },
];

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
const pivotBy: any[] = [];

const domProps = {
  style: {
    height: '80vh',
  },
};

const showTotals = ref(true);
</script>

<template>
  <button @click="showTotals = !showTotals">toggle show totals</button>
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
        :pivotTotalColumnPosition="showTotals ? 'end' : false"
      />
    </template>
  </DataSource>
</template>

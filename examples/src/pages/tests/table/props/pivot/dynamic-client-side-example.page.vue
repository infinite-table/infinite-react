<script setup lang="ts">
import { ref } from 'vue';

import {
  DataSource,
  InfiniteTable,
  GroupRowsState,
} from '@infinite-table/infinite-vue';

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

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: Record<string, any> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  age: {
    field: 'age',
    type: ['number'],
  },
  salary: {
    field: 'salary',
    type: ['number', 'currency'],
    style: {
      color: 'red',
    },
  },

  currency: { field: 'currency' },
};

// Groupings
const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

const avgReducer = {
  initialValue: 0,

  reducer: (acc: number, sum: number) => acc + sum,
  done: (sum: number, arr: any[]) => (arr.length ? sum / arr.length : 0),
};

const domProps = {
  style: {
    height: '70vh',
  },
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

const groupBy = ref<any[]>([]);
const pivotBy = ref<any[]>([]);

const isGrouped = ref(false);
const isPivoted = ref(false);

const refresh = ref(0);

(globalThis as any).setGroupBy = (value: any[]) => {
  groupBy.value = value;
};
(globalThis as any).setPivotBy = (value: any[]) => {
  pivotBy.value = value;
};
</script>

<template>
  <button style="color: magenta" @click="refresh = refresh + 1">
    refresh
  </button>

  <label style="color: magenta">
    Pivoted
    <input
      type="checkbox"
      name="pivoted"
      :checked="isPivoted"
      @change="isPivoted = ($event.target as HTMLInputElement).checked"
    />
  </label>
  <label style="color: magenta">
    Grouped
    <input
      type="checkbox"
      name="grouped"
      :checked="isGrouped"
      @change="isGrouped = ($event.target as HTMLInputElement).checked"
    />
  </label>
  <DataSource
    primaryKey="id"
    :data="dataSource"
    :groupBy="isGrouped ? groupBy : undefined"
    :pivotBy="isPivoted ? pivotBy : undefined"
    :aggregationReducers="reducers"
    :defaultGroupRowsState="groupRowsState"
  >
    <template #default="{ pivotColumns, pivotColumnGroups }">
      <InfiniteTable
        :domProps="domProps"
        :columns="columns"
        :virtualizeColumns="false"
        :pivotColumns="pivotColumns"
        :pivotColumnGroups="pivotColumnGroups"
        pivotTotalColumnPosition="end"
      />
    </template>
  </DataSource>
</template>

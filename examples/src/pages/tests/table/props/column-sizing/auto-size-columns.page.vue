<script setup lang="ts">
import { computed, ref } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type {
  InfiniteTableColumn,
  InfiniteTablePropColumnSizing,
} from '@infinite-table/infinite-vue';

import { employees } from '../group-by/employees10';

type Employee = {
  id: number;
  companyName: string;
  companySize: string;
  firstName: string;
  lastName: string;
  country: string;
  countryCode: string;
  city: string;
  streetName: string;
  streetNo: number;
  department: string;
  team: string;
  salary: number;
  age: number;
  email: string;
};

const dataSource = () => employees as Employee[];
const columns: Record<string, InfiniteTableColumn<Employee>> = {
  id: { field: 'id' },
  country: {
    field: 'country',
    type: 'country',
    defaultWidth: 300,
    renderMenuIcon: false,
  },
  city: { field: 'city' },
  team: { field: 'team' },
  salary: { field: 'salary', type: 'empty', renderMenuIcon: false },
  age: {
    field: 'age',
    header: 'the age field',
  },
};

const defaultColumnSizing: InfiniteTablePropColumnSizing = {
  age: {
    width: 800,
  },
  salary: {
    width: 145,
  },
};

const domProps = {
  style: {
    margin: '5px',
    height: '90vh',
    width: '95vw',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

const columnTypes = {
  default: {
    renderMenuIcon: false,
  },
};

const currentData = ref<any>(() => dataSource());

const autoSizeId = ref(0);

const columnSizing = ref<InfiniteTablePropColumnSizing>(defaultColumnSizing);

const onColumnSizingChange = (sizing: InfiniteTablePropColumnSizing) => {
  columnSizing.value = sizing;
};

const autoSizeColumnsKey = computed(() => {
  const autoSizeValue = (globalThis as any).autoSize;
  return autoSizeId.value
    ? typeof (autoSizeValue === 'number')
      ? autoSizeValue
      : {
          key: autoSizeId.value,

          ...(autoSizeValue || {}),
        }
    : undefined;
});

const onAutoSizeClick = () => {
  autoSizeId.value = autoSizeId.value + 1;
};
</script>

<template>
  <button @click="onAutoSizeClick">auto size</button>
  <DataSource primaryKey="id" :data="currentData">
    <InfiniteTable
      :domProps="domProps"
      :columnSizing="columnSizing"
      :onColumnSizingChange="onColumnSizingChange"
      :columnMinWidth="50"
      :columns="columns"
      :columnTypes="columnTypes"
      :columnDefaultWidth="200"
      :autoSizeColumnsKey="autoSizeColumnsKey"
    />
  </DataSource>
</template>

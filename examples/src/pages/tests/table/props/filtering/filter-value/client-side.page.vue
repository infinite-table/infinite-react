<script setup lang="ts">
import { defineComponent, h, ref } from 'vue';

import {
  DataSource,
  InfiniteTable,
  useDataSourceContext,
} from '@infinite-table/infinite-vue';

import { employees } from '../employees10';

const dataSource = () => {
  return Promise.resolve(employees);
};

const columns: Record<string, any> = {
  firstName: {
    field: 'firstName',
    header: 'First Name',
  },
  country: {
    field: 'country',
    header: 'Country',
  },
  city: {
    field: 'city',
    header: 'City',
  },
  age: {
    field: 'age',
    type: 'number',
    header: 'Age',
  },
  department: {
    field: 'department',
    header: 'Department',
  },
  salary: {
    field: 'salary',
    type: 'number',
  },
  team: {
    field: 'team',
  },
};

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

const shouldReloadData = {
  filterValue: false,
};

const UnfilteredCount = defineComponent({
  setup() {
    const context = useDataSourceContext();
    return () =>
      h(
        'p',
        { style: { color: 'magenta' }, 'aria-label': 'unfiltered-count' },
        `unfiltered count: ${context?.state?.value?.unfilteredCount}`,
      );
  },
});

const filterValue = ref<any>(undefined);

const setManagement = () => {
  filterValue.value = [
    {
      field: 'department',
      filter: {
        type: 'string',
        operator: 'eq',
        value: 'Management',
      },
    },
  ];
};

const setMarketing = () => {
  filterValue.value = [
    {
      field: 'department',
      filter: {
        type: 'string',
        operator: 'eq',
        value: 'Marketing',
      },
    },
  ];
};
</script>

<template>
  <h2>Current filter value:</h2>
  <button data-name="none" @click="filterValue = undefined">
    Clear filter
  </button>
  <button data-name="management" @click="setManagement">
    Filter by deparment=management
  </button>
  <button data-name="marketing" @click="setMarketing">
    Filter by deparment=marketing
  </button>

  <DataSource
    :data="dataSource"
    primaryKey="id"
    :shouldReloadData="shouldReloadData"
    :filterValue="filterValue"
  >
    <InfiniteTable
      :domProps="domProps"
      :columnDefaultWidth="150"
      :columns="columns"
    />
    <UnfilteredCount />
  </DataSource>
</template>

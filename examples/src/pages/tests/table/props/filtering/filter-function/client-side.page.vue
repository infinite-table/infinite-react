<script setup lang="ts">
import { ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { employees } from '../employees10';
import type { Employee } from '../employees10';

import {
  departmentManagementFilterFunction,
  departmentMarketingFilterFunction,
} from './filterFn';

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

const filterFn = ref<((param: { data: Employee }) => boolean) | undefined>(
  undefined,
);
</script>

<template>
  <h2>Current filter function: {{ filterFn?.name }}</h2>
  <button data-name="none" @click="filterFn = undefined">Clear filter</button>
  <button
    data-name="management"
    @click="filterFn = departmentManagementFilterFunction"
  >
    Filter by deparment=management
  </button>
  <button
    data-name="marketing"
    @click="filterFn = departmentMarketingFilterFunction"
  >
    Filter by deparment=marketing
  </button>

  <DataSource :data="dataSource" primaryKey="id" :filterFunction="filterFn">
    <InfiniteTable
      :domProps="domProps"
      :columnDefaultWidth="150"
      :columns="columns"
    />
  </DataSource>
</template>

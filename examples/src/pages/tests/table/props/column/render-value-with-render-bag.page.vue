<script setup lang="ts">
import { h, ref } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type { InfiniteTableColumn } from '@infinite-table/infinite-vue';

import { Employee } from './employees10';

const dataSource = () => {
  const data: Employee[] = [
    {
      age: 1,
      city: 'test',
      companyName: 'test',
      companySize: '1 - 10',
      country: 'test',
      countryCode: 'test',
      department: 'test',
      email: 'test@test.com',
      firstName: 'Mark',
      lastName: 'test',
      id: 1,
      salary: 5000,
      streetName: 'test',
      streetNo: 1,
      team: 'test',
    },
  ];

  return Promise.resolve(data);
};

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

const state = ref(0);

const increment = () => {
  state.value = state.value + 1;
};

const columns: Record<string, InfiniteTableColumn<Employee>> = {
  firstName: {
    field: 'firstName',
    header: 'First Name',
    renderValue: (params: any) => {
      return h('button', { 'data-name': 'target' }, [
        'x ',
        params.renderBag.value,
      ]);
    },
  },
};
</script>

<template>
  <button @click="increment">increment state</button>
  Current state: {{ state }}
  <DataSource :data="dataSource" primaryKey="id">
    <InfiniteTable
      :domProps="domProps"
      :columnDefaultWidth="150"
      :columns="columns"
    />
  </DataSource>
</template>

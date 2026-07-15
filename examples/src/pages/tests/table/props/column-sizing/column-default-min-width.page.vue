<script setup lang="ts">
import { ref } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type {
  DataSourceData,
  DataSourceDataParams,
  InfiniteTableColumn,
  InfiniteTablePropColumnSizing,
  InfiniteTablePropColumnTypes,
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

const dataSource = () => {
  return Promise.resolve(employees as Employee[]);
};
const columns: Record<string, InfiniteTableColumn<Employee>> = {
  id: { field: 'id', defaultWidth: 500 },
  country: {
    field: 'country',
    type: 'country',
    defaultWidth: 300,
  },
  city: { field: 'city' },
  team: { field: 'team' },
  department: { field: 'department' },
  firstName: { field: 'firstName', defaultWidth: 777, type: 'empty' },
  lastName: { field: 'lastName' },
  salary: { field: 'salary', type: 'empty', defaultWidth: 555 },
  age: { field: 'age', type: 'custom-number', defaultWidth: 110 },
};

const defaultColumnSizing: InfiniteTablePropColumnSizing = {
  age: {
    width: 1000,
  },
  salary: {
    width: 145,
  },
};

const columnTypes: InfiniteTablePropColumnTypes<Employee> = {
  'custom-number': {
    align: 'end',
    defaultWidth: 100,
  },
  country: {
    minWidth: 450,
  },
  empty: {},
  default: {
    defaultWidth: 234,
    align: 'center',
    renderValue: ({ value }) => `${value}!!!`,
  },
};

const domProps = {
  style: {
    margin: '5px',
    height: '90vh',
    width: '5000px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

const onDataChange = (dataInfo: DataSourceDataParams<Employee>) => {
  console.log(dataInfo);
};

const currentData = ref<DataSourceData<Employee>>(dataSource);

const update = () => {
  currentData.value = [] as Employee[];

  setTimeout(() => {
    currentData.value = dataSource.bind({});
  }, 1000);
};
</script>

<template>
  <button @click="update">UPDATE</button>
  <DataSource
    primaryKey="id"
    :data="currentData"
    :onDataParamsChange="onDataChange"
  >
    <InfiniteTable
      :domProps="domProps"
      :columnTypes="columnTypes"
      :defaultColumnSizing="defaultColumnSizing"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>

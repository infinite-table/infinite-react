<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  companyName: string;
  countryCode: string;
  companySize: string;
  streetName: string;
  streetPrefix: string;
  streetNo: number;
  reposCount: number;
  email: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};
const developers: Developer[] = [
  {
    id: 0,
    companyName: 'Hilll Inc',
    companySize: '0 - 10',
    firstName: 'Nya',
    lastName: 'Klein',
    country: 'India',
    countryCode: 'IN',
    city: 'Unnao',
    streetName: 'Purdy Lane',
    streetPrefix: 'Landing',
    streetNo: 183,
    age: 24,
    currency: 'JPY',
    preferredLanguage: 'TypeScript',
    reposCount: 35,
    stack: 'backend',
    canDesign: 'yes',
    salary: 60000,
    hobby: 'sports',
    email: 'Nya44@gmail.com',
  },
];

const domProps = {
  style: {
    height: '80vh',
  },
};
const aggregationReducers: Record<string, any> = {
  salary: {
    name: 'Salary (avg)',
    field: 'salary',
    reducer: 'avg',
  },
  age: {
    name: 'Age (avg)',
    field: 'age',
    reducer: 'avg',
  },
};
const columns: Record<string, any> = {
  preferredLanguage: { field: 'preferredLanguage' },
  age: { field: 'age' },

  salary: {
    field: 'salary',
    type: 'number',
  },
  canDesign: { field: 'canDesign' },
  country: { field: 'country' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

const dataSource = developers;

const groupBy = [
  {
    field: 'country' as const,
    column: {
      style: () => ({
        color: 'red',
      }),
    },
  },
  {
    field: 'city' as const,
    column: {
      style: {
        color: 'blue',
      },
    },
  },
];
</script>

<template>
  <DataSource
    :data="dataSource"
    primaryKey="id"
    :groupBy="groupBy"
    :aggregationReducers="aggregationReducers"
  >
    <InfiniteTable
      :domProps="domProps"
      :columnDefaultWidth="150"
      :columns="columns"
    />
  </DataSource>
</template>

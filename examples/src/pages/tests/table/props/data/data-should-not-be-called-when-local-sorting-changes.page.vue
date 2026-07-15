<script setup lang="ts">
import { computed, ref } from 'vue';

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
};

const developers: Developer[] = [
  {
    id: 0,
    firstName: 'Nya',
    lastName: 'Klein',
    country: 'India',
    city: 'Unnao',
    age: 40,
    currency: 'JPY',
    preferredLanguage: 'TypeScript',
    stack: 'backend',
    canDesign: 'yes',
    salary: 60000,
    hobby: 'sports',
  },
  {
    id: 1,
    firstName: 'Axel',
    lastName: 'Runolfsson',
    country: 'Mexico',

    city: 'Cuitlahuac',

    age: 20,
    currency: 'USD',
    preferredLanguage: 'TypeScript',
    stack: 'backend',
    canDesign: 'no',
    salary: 100000,
    hobby: 'sports',
  },
  {
    id: 2,
    firstName: 'Gonzalo',
    lastName: 'McGlynn',
    country: 'United Arab Emirates',
    city: 'Fujairah',
    age: 60,
    currency: 'JPY',
    preferredLanguage: 'Go',
    stack: 'frontend',
    canDesign: 'yes',
    salary: 120000,
    hobby: 'photography',
  },
];

const dataSource = () => {
  (globalThis as any).timesCalled = ((globalThis as any).timesCalled || 0) + 1;
  return developers;
};

const columns: Record<string, any> = {
  identifier: {
    field: 'id',
  },
  name: {
    field: 'firstName',
    name: 'First Name',
  },
  city: { field: 'city' },
  stack: { field: 'stack' },

  fullName: {
    name: 'Full name',
    render: ({ data }: { data: Developer | null }) => {
      return `${data?.firstName} - ${data?.lastName}`;
    },
  },
  age: {
    field: 'age',
    type: 'number',
  },
  salary: {
    field: 'salary',
    type: 'number',
  },
  country: {
    field: 'country',
  },
};
const domProps = {
  style: {
    margin: '5px',

    minHeight: '500px',
  },
};

const sortInfo = ref<any>([
  {
    field: 'age',
    dir: 1,
  },
]);
const sortMode = ref<'local' | 'remote'>('local');

const shouldReloadData = computed(() => {
  return {
    sortInfo: sortMode.value === 'remote',
  };
});

const onSortInfoChange = (newSortInfo: any) => {
  sortInfo.value = newSortInfo;
};
</script>

<template>
  <button @click="sortMode = 'local'">sort mode local</button>
  <button @click="sortMode = 'remote'">sort mode remote</button>
  <p style="color: tomato">Current sort mode: {{ sortMode }}</p>
  <DataSource
    :data="dataSource"
    primaryKey="id"
    :shouldReloadData="shouldReloadData"
    :onSortInfoChange="onSortInfoChange"
    :sortInfo="sortInfo"
  >
    <InfiniteTable
      :domProps="domProps"
      :columnDefaultWidth="150"
      :columns="columns"
    />
  </DataSource>
</template>

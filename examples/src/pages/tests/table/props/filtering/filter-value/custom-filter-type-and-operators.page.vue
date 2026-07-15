<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  age: number;
};

const data: Developer[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Bob',
    age: 20,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 2,
    firstName: 'Marry',
    lastName: 'Bob',
    age: 35,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 3,
    firstName: 'Bill',
    lastName: 'Bobson',
    age: 30,
    canDesign: 'no',
    currency: 'CAD',
    preferredLanguage: 'TypeScript',
    stack: 'frontend',
  },
  {
    id: 4,
    firstName: 'Mark',
    lastName: 'Twain',
    age: 31,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Rust',
    stack: 'backend',
  },
  {
    id: 5,
    firstName: 'Matthew',
    lastName: 'Hilson',
    age: 29,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Go',
    stack: 'backend',
  },
];

const columns: Record<string, any> = {
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
  },
  age: {
    defaultFilterable: true,
    field: 'age',
    type: 'custom-number',
  },
  stack: { field: 'stack' },
  currency: { field: 'currency', defaultFilterable: false },
};

const defaultFilterValue = [
  {
    field: 'age' as const,
    filter: {
      operator: 'gtx',
      value: 30,
      type: 'custom-number',
    },
  },
];

const filterTypes = {
  'custom-number': {
    defaultOperator: 'gtx',
    emptyValues: ['', null, undefined],
    operators: [
      {
        name: 'gtx',
        fn: ({ currentValue, filterValue, emptyValues }: any) => {
          if (
            emptyValues.includes(currentValue) ||
            emptyValues.includes(filterValue)
          ) {
            return true;
          }
          return currentValue > filterValue;
        },
      },
      {
        name: 'ltx',
        fn: ({ currentValue, filterValue, emptyValues }: any) => {
          if (
            emptyValues.includes(currentValue) ||
            emptyValues.includes(filterValue)
          ) {
            return true;
          }
          return currentValue < filterValue;
        },
      },
    ],
  },
};

const domProps = {
  style: {
    height: '100%',
  },
};
</script>

<template>
  <DataSource
    :data="data"
    primaryKey="id"
    :defaultFilterValue="defaultFilterValue"
    :filterDelay="0"
    :filterTypes="filterTypes"
  >
    <InfiniteTable
      :domProps="domProps"
      :columnDefaultWidth="150"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>

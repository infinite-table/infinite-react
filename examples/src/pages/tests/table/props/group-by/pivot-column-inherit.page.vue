<script setup lang="ts">
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

const dataSource = developers;

const avgReducer = {
  initialValue: 0,
  reducer: (acc: number, sum: number) => acc + sum,
  done: (sum: number, arr: any[]) => {
    return Math.floor(arr.length ? sum / arr.length : 0);
  },
};

const aggregationReducers = {
  salary: { field: 'salary' as const, ...avgReducer },
  age: {
    field: 'age' as const,
    ...avgReducer,
    pivotColumn: {
      defaultWidth: 500,
      inheritFromColumn: 'preferredLanguage',
    },
  },
};

const columns: Record<string, any> = {
  preferredLanguage: {
    field: 'preferredLanguage',
    style: {
      color: 'blue',
    },
  },
  age: {
    field: 'age',
    style: {
      color: 'magenta',
      background: 'yellow',
    },
  },
  salary: {
    field: 'salary',
    type: 'number',
    style: {
      color: 'red',
    },
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

const domProps = { style: { height: '100vh' } };

const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

const groupBy = [
  {
    field: 'country' as const,
  },
  {
    field: 'stack' as const,
    column: {
      header: 'test',
      render: ({ value }: { value: any }) => value,
    },
  },
];

const pivotBy = [
  {
    field: 'currency' as const,
  },

  {
    field: 'canDesign' as const,
    column: (param: any) => {
      const { column } = param;

      return {
        ...column,
      };
    },
  },
];
</script>

<template>
  <DataSource
    primaryKey="id"
    :data="dataSource"
    :groupBy="groupBy"
    :pivotBy="pivotBy"
    :aggregationReducers="aggregationReducers"
    :defaultGroupRowsState="groupRowsState"
  >
    <template v-slot="{ pivotColumns, pivotColumnGroups }">
      <InfiniteTable
        :domProps="domProps"
        :columns="columns"
        groupRenderStrategy="single-column"
        :hideEmptyGroupColumns="true"
        :pivotColumns="pivotColumns"
        :pivotColumnGroups="pivotColumnGroups"
        :columnDefaultWidth="220"
      />
    </template>
  </DataSource>
</template>

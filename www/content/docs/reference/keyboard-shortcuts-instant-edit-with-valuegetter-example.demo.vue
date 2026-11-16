<script setup lang="ts">
import {
  InfiniteTable,
  DataSource,
  keyboardShortcuts,
} from '@infinite-table/infinite-vue';
import type {
  DataSourceData,
  InfiniteTablePropColumns,
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
};

const dataSource: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql?`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  preferredLanguage: { field: 'preferredLanguage', header: 'Language' },

  salary: {
    field: 'salary',
    type: 'number',
  },
  salaryK: {
    valueGetter: ({ data }) => data.salary / 1000,
    header: 'Salary (thousands)',
    type: 'number',
    defaultEditable: false,
  },
  country: {
    field: 'country',
    header: 'Country',
  },
  age: { field: 'age' },
  canDesign: { field: 'canDesign' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id', defaultEditable: false },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};
</script>

<template>
  <DataSource primaryKey="id" :data="dataSource">
    <InfiniteTable
      debugId="keyboard-shortcuts-instant-edit-with-valuegetter-example"
      :columns="columns"
      :columnDefaultEditable="true"
      :keyboardShortcuts="[keyboardShortcuts.instantEdit]"
    />
  </DataSource>
</template>

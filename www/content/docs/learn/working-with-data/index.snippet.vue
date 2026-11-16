<!--
  Code shown on the Vue version of the "Working with Data" page: the sibling
  of index.snippet.tsx, with the same `#region` names. Type-checked with
  vue-tsc against the current source.
-->
<script setup lang="ts">
import { InfiniteTable } from '@infinite-table/infinite-vue';

//#region local-data
import { DataSource } from '@infinite-table/infinite-vue';

type Employee = {
  id: string | number;
  name: string;
  salary: number;
  department: string;
  company: string;
};

const employees: Employee[] = [
  { id: 1, name: 'Bob', salary: 10_000, department: 'IT', company: 'Bobsons' },
  {
    id: 2,
    name: 'Alice',
    salary: 20_000,
    department: 'IT',
    company: 'Bobsons',
  },
  { id: 3, name: 'John', salary: 30_000, department: 'IT', company: 'Bobsons' },
];

// <DataSource primaryKey="id" :data="employees" />
//#endregion

// the name the docs use for the generic type
type DATA_TYPE = Employee;

//#region generic-type
import type {
  DataSourceData,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-vue';

const data: DataSourceData<DATA_TYPE> = [ /* ... */ ];
const columns: InfiniteTablePropColumns<DATA_TYPE> = { /* ... */ };

// <DataSource primaryKey="id" :data="data">
//   <InfiniteTable :columns="columns" />
// </DataSource>
//#endregion
</script>

<template>
  <!-- #region intro -->
  <!-- `data` can also be a Promise or a function returning a Promise -->
  <DataSource primaryKey="id" :data="[]" />
  <!-- #endregion -->

  <DataSource primaryKey="id" :data="employees" />

  <DataSource primaryKey="id" :data="data">
    <InfiniteTable :columns="columns" />
  </DataSource>
</template>

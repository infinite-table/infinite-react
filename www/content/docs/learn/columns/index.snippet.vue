<!--
  Code shown on the Vue version of the "Working with Columns" page: the sibling
  of index.snippet.tsx, with the same `#region` names. Type-checked with
  vue-tsc against the current source.
-->
<script setup lang="ts">
import { ref } from 'vue';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

//#region intro
export type Employee = {
  id: number;
  companyName: string;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  department: string;
  team: string;
  salary: number;
};

// InfiniteTableColumn is a generic type, you have to bind it to a specific data-type
import type { InfiniteTableColumn } from '@infinite-table/infinite-vue';

// we're binding it here to the `Employee` type
// which means the `column.field` has to be `keyof Employee`
const columns: Record<string, InfiniteTableColumn<Employee>> = {
  firstName: {
    field: 'firstName',
    header: 'First Name',
  },
  country: {
    field: 'country',
  },
  city: {
    field: 'city',
  },
  salary: {
    field: 'salary',
    type: 'number',
  },
};
// <InfiniteTable :columns="columns" />
//#endregion

declare const data: Employee[];

//#region column-order
const columnOrder = ref(['firstName', 'id', 'curency']);

const onColumnOrderChange = (newColumnOrder: string[]) => {
  columnOrder.value = newColumnOrder;
};

// <DataSource primaryKey="id" :data="data">
//   <InfiniteTable
//     :columns="columns"
//     :columnOrder="columnOrder"
//     :onColumnOrderChange="onColumnOrderChange"
//   />
// </DataSource>
//#endregion
</script>

<template>
  <DataSource primaryKey="id" :data="data">
    <InfiniteTable
      :columns="columns"
      :columnOrder="columnOrder"
      :onColumnOrderChange="onColumnOrderChange"
    />
  </DataSource>
</template>

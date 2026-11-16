<!--
  Code shown on the Vue version of the "Column Types" page: the sibling of
  column-types.snippet.tsx, with the same `#region` names (the regions that
  are the same code for React and Vue are shown from the .tsx file).
  Type-checked with vue-tsc against the current source.
-->
<script setup lang="ts">
import {
  InfiniteTable,
  type InfiniteTablePropColumns,
  type InfiniteTablePropColumnTypes,
} from '@infinite-table/infinite-vue';

//#region intro
type Person = {
  name: string;
  dob: string;
  age: number;
};
const columns: InfiniteTablePropColumns<Person> = {
  age: {
    field: 'age',
    type: 'custom',
  },
  date: {
    field: 'dob',
    // will be type default
  },
  name: {
    field: 'name',
    // will have both of those types
    type: ['default', 'custom'],
  },
};

const columnTypes: InfiniteTablePropColumnTypes<Person> = {
  default: {
    defaultWidth: 200,
  },
  custom: {
    align: 'center',
  },
};

// <InfiniteTable :columnTypes="columnTypes" :columns="columns" />
//#endregion
</script>

<template>
  <InfiniteTable :columnTypes="columnTypes" :columns="columns" />
</template>

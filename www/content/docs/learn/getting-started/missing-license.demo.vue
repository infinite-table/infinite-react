<script setup lang="ts">
import '@infinite-table/infinite-vue/index.css';

import {
  InfiniteTable,
  DataSource,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-vue';

type Person = {
  Id: number;
  FirstName: string;
  Age: number;
};

const data: Person[] = [
  { Id: 1, FirstName: 'Bob', Age: 3 },
  { Id: 2, FirstName: 'Alice', Age: 50 },
  { Id: 3, FirstName: 'Bill', Age: 5 },
];

const columns: InfiniteTablePropColumns<Person> = {
  id: {
    // specifies which field from the data source
    // should be rendered in this column
    field: 'Id',
    type: 'number',
    defaultWidth: 80,
  },
  firstName: {
    field: 'FirstName',
  },
  age: { field: 'Age', type: 'number' },
};
</script>

<template>
  <DataSource :data="data" primaryKey="Id">
    <InfiniteTable
      debugId="missing-license"
      licenseKey=""
      :columnDefaultWidth="130"
      :columns="columns"
    />
  </DataSource>
</template>

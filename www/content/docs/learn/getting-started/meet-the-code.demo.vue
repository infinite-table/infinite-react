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

//#highlight columns are objects keyed by the column id
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
    header: 'First Name',
  },
  age: { field: 'Age', type: 'number' },
};

const data: Person[] = [
  {
    Id: 1,
    FirstName: 'Bob',
    Age: 3,
  },
  {
    Id: 2,
    FirstName: 'Alice',
    Age: 50,
  },
  {
    Id: 3,
    FirstName: 'Bill',
    Age: 5,
  },
];
</script>

<template>
  <!-- #highlight the DataSource holds the data, the InfiniteTable renders it -->
  <DataSource :data="data" primaryKey="Id">
    <InfiniteTable debugId="meet-the-code" :columns="columns" />
  </DataSource>
  <!-- #endhighlight -->
</template>

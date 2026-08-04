<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

interface Person {
  Id: number;
  FirstName: string;
  Age: number;
}

const data: Person[] = [
  {
    Id: 20,
    FirstName: 'Bob',
    Age: 3,
  },
  {
    Id: 3,
    FirstName: 'Alice',
    Age: 50,
  },
  {
    Id: 10,
    FirstName: 'Bill',
    Age: 5,
  },
];

const columns = {
  id: {
    field: 'Id' as const,
    type: 'number',
    defaultSortable: true,
  },
  firstName: {
    field: 'FirstName' as const,
  },
  age: { field: 'Age' as const, type: 'number' },
};

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};
</script>

<template>
  <p>
    Table is configured with <b>sortable=false</b> on this page, but the
    <b>Id</b> column specifically configured as <b>sortable=true</b>
  </p>
  <DataSource :data="data" primaryKey="Id">
    <InfiniteTable
      :domProps="domProps"
      :columnDefaultWidth="100"
      :columnDefaultSortable="false"
      :virtualizeColumns="false"
      :columns="columns"
    />
  </DataSource>
</template>

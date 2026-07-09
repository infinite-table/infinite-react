<script setup lang="ts">
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type { InfiniteTableColumn } from '@infinite-table/infinite-vue';

import styles from './cssvar.module.css';

interface Person {
  Id: number;
  FirstName: string;
  LastName: string;
  Address: string;
  Age: number;
}

const data = [
  {
    Id: 20,
    FirstName: 'Bob',
    LastName: 'Bobson',
    Address: 'United States, Nashvile 8, rue due Secour',
    Age: 3,
  },
  {
    Id: 3,
    FirstName: 'Alice',
    LastName: 'Aliceson',
    Address: 'United States, San Francisco 5',
    Age: 50,
  },
  {
    Id: 10,
    FirstName: 'Bill',
    LastName: 'Billson',
    Address: 'France, Paris, Sur seine',
    Age: 5,
  },
];

const columns: Record<string, InfiniteTableColumn<Person>> = {
  Id: {
    field: 'Id',
    type: 'number',
  },
  FirstName: {
    field: 'FirstName',
    header: 'First Name',
  },
  LastName: {
    field: 'LastName',
    header: 'Last Name',
  },
  Age: {
    field: 'Age',
    type: 'number',
  },
};

const fields = ['Id', 'FirstName', 'Age', 'Address', 'LastName'] as const;

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
  <div :class="styles.wrap">
    <DataSource :data="data" primaryKey="Id" :fields="fields">
      <InfiniteTable
        :domProps="domProps"
        :columnDefaultWidth="200"
        :columns="columns"
        rowHeight="--custom-row-height"
      />
    </DataSource>
  </div>
</template>

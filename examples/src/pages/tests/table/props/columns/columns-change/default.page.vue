<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type { InfiniteTableColumn } from '@infinite-table/infinite-vue';

type Person = {
  Id: number;
  FirstName: string;
  Age: number;
};

const data = (): Promise<Person[]> =>
  Promise.resolve([
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
    {
      Id: 4,
      FirstName: 'Mark',
      Age: 25,
    },
    {
      Id: 5,
      FirstName: 'John',
      Age: 38,
    },
    {
      Id: 6,
      FirstName: 'Peter',
      Age: 14,
    },
  ]);

const columns: Record<string, InfiniteTableColumn<Person>> = {
  identifier: {
    field: 'Id',
    type: 'number',
    defaultSortable: true,
    defaultWidth: 80,
  },
  firstName: {
    field: 'FirstName',
  },
  age: { field: 'Age', type: 'number' },
};
const domProps = {
  style: { height: '80vh' },
};

const cols = ref<Record<string, InfiniteTableColumn<Person>>>({});

onMounted(() => {
  setTimeout(() => {
    cols.value = columns;
  });
});
</script>

<template>
  <DataSource :data="data" primaryKey="Id">
    <InfiniteTable :columns="cols" :domProps="domProps" />
  </DataSource>
</template>

<script setup lang="ts">
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-vue';

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id', // will be used as default label in column header
    defaultWidth: 100,
  },
  name: {
    header: 'First and Last Name', // custom column header label
    valueGetter: ({ data }) => `${data.firstName} ${data.lastName}`,
  },
};

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const domProps = {
  style: {
    minHeight: '300px',
  },
};
</script>

<template>
  <DataSource primaryKey="id" :data="dataSource">
    <InfiniteTable
      debugId="column-header-example"
      :domProps="domProps"
      :columns="columns"
    />
  </DataSource>
</template>

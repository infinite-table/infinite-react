<script setup lang="ts">
import { h } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-vue';

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

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 80 },
  stack: {
    field: 'stack',
  },
  firstName: {
    field: 'firstName',
    header: () => 'First Name',
    renderSortIcon: ({ renderBag }: any) => {
      return h('span', ['hey ', renderBag.sortIcon]);
    },
  },
  preferredLanguage: { field: 'preferredLanguage' },
};

const defaultSortInfo = {
  field: 'firstName' as const,
  dir: 1 as const,
};

const domProps = {
  style: { height: '80vh' },
};
</script>

<template>
  <DataSource
    primaryKey="id"
    :data="dataSource"
    :defaultSortInfo="defaultSortInfo"
  >
    <InfiniteTable
      :domProps="domProps"
      :columns="columns"
      :columnDefaultWidth="200"
    />
  </DataSource>
</template>

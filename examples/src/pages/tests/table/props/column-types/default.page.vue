<script setup lang="ts">
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type {
  InfiniteTableColumn,
  InfiniteTablePropColumnTypes,
} from '@infinite-table/infinite-vue';

import fetch from 'isomorphic-fetch';

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
  // return Promise.resolve(employees);
  return fetch(`${process.env.NEXT_PUBLIC_BASE_URL!}/developers10`)
    .then((r: any) => r.json())
    .then((data: Developer[]) => {
      return data;
    });
};

const columns: Record<string, InfiniteTableColumn<Developer>> = {
  id: { field: 'id', type: 'numeric' },

  country: {
    field: 'country',
    type: null,
  },
  city: { field: 'city' },
  salary: { field: 'salary', type: ['default', 'numeric'] },
};
const columnTypes: InfiniteTablePropColumnTypes<Developer> = {
  default: {
    defaultWidth: 155,
  },
  numeric: {
    defaultWidth: 255,
    defaultSortable: false,
    header: 'number col',
  },
};

const onReady = ({ api }: { api: any }) => {
  (globalThis as any).api = api;
};

const domProps = {
  style: {
    margin: '5px',
    height: '60vh',
    width: '95vw',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};
</script>

<template>
  <DataSource primaryKey="id" :data="dataSource">
    <InfiniteTable
      :domProps="domProps"
      :onReady="onReady"
      :columnTypes="columnTypes"
      :columnDefaultWidth="400"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>

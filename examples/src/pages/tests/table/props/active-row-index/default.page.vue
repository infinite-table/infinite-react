<script setup lang="ts">
import { ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import type { InfiniteTableApi } from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;

  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers100-sql`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: Record<string, any> = {
  preferredLanguage: { field: 'preferredLanguage' },
  country: { field: 'country' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  age: { field: 'age' },
  canDesign: { field: 'canDesign' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

const infiniteTableApi = ref<InfiniteTableApi<Developer> | null>(null);

const onReady = ({ api }: { api: InfiniteTableApi<Developer> }) => {
  infiniteTableApi.value = api;
};

const scrollLeft = () => {
  infiniteTableApi.value!.scrollLeft = 100;
};

const domProps = {
  autoFocus: true,
  style: {
    height: '800px',
  },
};

const columnPinning = {
  stack: true,
};
</script>

<template>
  <button @click="scrollLeft">scroll left = 100</button>
  <DataSource primaryKey="id" :data="dataSource">
    <InfiniteTable
      :onReady="onReady"
      :columns="columns"
      :defaultActiveRowIndex="99"
      keyboardNavigation="row"
      :domProps="domProps"
      :columnPinning="columnPinning"
    />
  </DataSource>
</template>

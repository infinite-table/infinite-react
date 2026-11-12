<script setup lang="ts">
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import type {
  DataSourceData,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-vue';

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

const dataSource: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers100-sql?`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  preferredLanguage: { field: 'preferredLanguage' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  age: { field: 'age' },

  canDesign: { field: 'canDesign' },
  country: { field: 'country' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};
const shouldReloadData = {
  sortInfo: false, // #highlight sorted in the browser
};
</script>

<template>
  <DataSource
    primaryKey="id"
    :data="dataSource"
    :defaultSortInfo="{ field: 'salary', dir: -1 }"
    :shouldReloadData="shouldReloadData"
  >
    <InfiniteTable
      debugId="local-uncontrolled-single-sorting-example-with-remote-data"
      :columns="columns"
      :columnDefaultWidth="220"
    />
  </DataSource>
</template>

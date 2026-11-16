<script setup lang="ts">
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import type {
  DataSourcePropGroupBy,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-vue';

const groupBy: DataSourcePropGroupBy<Developer> = [
  {
    field: 'age',
    column: {
      renderGroupValue: ({ value }: { value: any }) => `Age: ${value}`,
    },
  },
  {
    field: 'stack',
  },
];

const columns: InfiniteTablePropColumns<Developer> = {
  country: {
    field: 'country',
  },
  firstName: { field: 'firstName' },
  age: { field: 'age' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  canDesign: { field: 'canDesign' },
  stack: { field: 'stack' },
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers10k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

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
</script>

<template>
  <DataSource :data="dataSource" primaryKey="id" :groupBy="groupBy">
    <InfiniteTable
      debugId="row-grouping-multi-column-example"
      :columns="columns"
      :columnDefaultWidth="150"
    />
  </DataSource>
</template>

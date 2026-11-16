<script setup lang="ts">
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import type {
  DataSourcePropGroupBy,
  InfiniteTableColumn,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-vue';

const groupBy: DataSourcePropGroupBy<Developer> = [
  {
    field: 'stack',
  },
  {
    field: 'preferredLanguage',
  },
];

const columns: InfiniteTablePropColumns<Developer> = {
  country: {
    field: 'country',
  },
  firstName: {
    field: 'firstName',
    style: {
      color: 'orange',
    },
    renderValue: ({ value, rowInfo }) =>
      rowInfo.isGroupRow ? null : `${value}.`,
  },
  stack: {
    field: 'stack',
    style: {
      color: 'tomato',
    },
  },
  age: { field: 'age' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  canDesign: { field: 'canDesign' },
};

const groupColumn: InfiniteTableColumn<Developer> = {
  field: 'firstName',
  renderValue: ({ value }) => {
    return `First name: ${value}`;
  },
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
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
      debugId="group-column-custom-renderers-example"
      :groupColumn="groupColumn"
      :columns="columns"
      :columnDefaultWidth="250"
    />
  </DataSource>
</template>

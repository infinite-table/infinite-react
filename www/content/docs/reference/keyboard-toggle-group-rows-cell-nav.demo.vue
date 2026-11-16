<script setup lang="ts">
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import type {
  DataSourceProps,
  InfiniteTableProps,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-vue';

const columns: InfiniteTablePropColumns<Developer> = {
  country: {
    field: 'country',
  },
  firstName: {
    field: 'firstName',
    defaultHiddenWhenGroupedBy: '*',
  },
  stack: {
    field: 'stack',
  },
  age: { field: 'age' },
  id: { field: 'id' },
  preferredLanguage: {
    field: 'preferredLanguage',
  },
  canDesign: {
    field: 'canDesign',
  },
};

const defaultGroupBy: DataSourceProps<Developer>['groupBy'] = [
  {
    field: 'canDesign',
  },
  {
    field: 'stack',
  },
  {
    field: 'preferredLanguage',
  },
];

const groupColumn: InfiniteTableProps<Developer>['groupColumn'] = {
  field: 'firstName',

  defaultWidth: 300,
};

const domProps = {
  style: {
    flex: 1,
    minHeight: '500px',
  },
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
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
  <DataSource :data="dataSource" :groupBy="defaultGroupBy" primaryKey="id">
    <InfiniteTable
      debugId="keyboard-toggle-group-rows-cell-nav"
      :columns="columns"
      :domProps="domProps"
      keyboardNavigation="cell"
      :hideColumnWhenGrouped="true"
      :groupColumn="groupColumn"
      :columnDefaultWidth="150"
    />
  </DataSource>
</template>

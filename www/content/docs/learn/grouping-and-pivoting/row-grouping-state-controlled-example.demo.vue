<script setup lang="ts">
import { shallowRef } from 'vue';
import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
} from '@infinite-table/infinite-vue';
import type {
  DataSourcePropGroupBy,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-vue';

const groupBy: DataSourcePropGroupBy<Developer> = [
  {
    field: 'country',
    column: {
      header: 'Country group',
      renderGroupValue: ({ value }) => `Country: ${value}`,
    },
  },
  {
    field: 'stack',
  },
];

const columns: InfiniteTablePropColumns<Developer> = {
  country: {
    field: 'country',
    // specifying a style here for the column
    // note: it will also be "picked up" by the group column
    // if you're grouping by the 'country' field
    style: {
      color: 'tomato',
    },
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

const groupRowsState = shallowRef<GroupRowsState<string>>(
  new GroupRowsState<string>({
    collapsedRows: true,
    expandedRows: [['Mexico'], ['Mexico', 'backend'], ['India']],
  }),
);

const setGroupRowsState = (newState: GroupRowsState<string>) => {
  groupRowsState.value = newState;
};

const expandAll = () => {
  const newState = new GroupRowsState<string>(groupRowsState.value);
  newState.expandAll();
  setGroupRowsState(newState);
};

const collapseAll = () => {
  const newState = new GroupRowsState<string>(groupRowsState.value);
  newState.collapseAll();
  setGroupRowsState(newState);
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
  <button @click="expandAll">Expand all</button>
  <button @click="collapseAll">Collapse all</button>
  <DataSource
    :data="dataSource"
    primaryKey="id"
    :groupBy="groupBy"
    :groupRowsState="groupRowsState"
    :onGroupRowsStateChange="setGroupRowsState"
  >
    <InfiniteTable
      debugId="row-grouping-state-controlled-example"
      :columns="columns"
    />
  </DataSource>
</template>

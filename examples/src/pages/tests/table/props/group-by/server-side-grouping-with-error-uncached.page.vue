<script setup lang="ts">
import {
  DataSource,
  InfiniteTable,
  GroupRowsState,
} from '@infinite-table/infinite-vue';

import { uncachedDataSource } from './server-side-grouping-with-error.data';

const domProps = {
  style: {
    height: '80vh',
  },
};

const columns: Record<string, any> = {
  preferredLanguage: { field: 'preferredLanguage' },
  age: { field: 'age' },

  salary: {
    field: 'salary',
    type: 'number',
  },
  canDesign: { field: 'canDesign' },
  country: { field: 'country' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

const groupBy = [
  {
    field: 'country' as const,
  },
  {
    field: 'city' as const,
  },
];

const groupColumn = {
  renderValue: ({ rowInfo }: { rowInfo: any }) => {
    if (!rowInfo.isGroupRow) {
      return rowInfo.value;
    }
    return rowInfo.error ?? rowInfo.value;
  },
};
</script>

<template>
  <DataSource
    primaryKey="id"
    :data="uncachedDataSource"
    :groupBy="groupBy"
    :defaultGroupRowsState="groupRowsState"
    :lazyLoad="true"
  >
    <InfiniteTable
      :domProps="domProps"
      :groupColumn="groupColumn"
      :columns="columns"
      groupRenderStrategy="single-column"
      :columnDefaultWidth="220"
    />
  </DataSource>
</template>

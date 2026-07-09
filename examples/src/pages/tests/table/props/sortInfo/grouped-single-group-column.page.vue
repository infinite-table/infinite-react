<script setup lang="ts">
import { ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { data, type Developer } from './grouped-single-group-column.data';

const defaultSortInfo = [
  {
    dir: 1,
    id: 'group-by',
    field: ['stack', 'preferredLanguage'] as (keyof Developer)[],
  },
  // { dir: 1, field: 'age' },
];

const columns: Record<string, any> = {
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
  },
  lastName: {
    field: 'lastName',
  },
  stack: {
    field: 'stack',
    // sortable: true,
  },
  preferredLanguage: {
    field: 'preferredLanguage',
  },
  age: {
    field: 'age',
  },
  canDesign: {
    field: 'canDesign',
  },
};

const defaultGroupBy = [
  {
    field: 'stack' as const,
  },
  {
    field: 'preferredLanguage' as const,
  },
];

const hideGroupColumns = ref(true);

const toggle = () => {
  hideGroupColumns.value = !hideGroupColumns.value;
};

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};
</script>

<template>
  <button @click="toggle">
    {{ hideGroupColumns ? 'show' : 'hide' }}
  </button>
  <DataSource
    :data="data"
    primaryKey="id"
    :defaultSortInfo="defaultSortInfo"
    :defaultGroupBy="defaultGroupBy"
  >
    <InfiniteTable
      :domProps="domProps"
      groupRenderStrategy="single-column"
      :rowHeight="40"
      :hideColumnWhenGrouped="hideGroupColumns"
      :columnDefaultWidth="150"
      :columns="columns"
    />
  </DataSource>
</template>

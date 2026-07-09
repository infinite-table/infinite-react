<script setup lang="ts">
import { ref } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type {
  InfiniteTableColumn,
  InfiniteTablePropColumnVisibility,
} from '@infinite-table/infinite-vue';

import { rowData, Car } from '../rowData';
import { columns } from '../columns';

const groupColumn: InfiniteTableColumn<Car> = {
  header: 'Grouping',
  field: 'make',
};

const columnVisibility = ref<InfiniteTablePropColumnVisibility>({});

const hideAll = () => {
  columnVisibility.value = {
    id: false,
    make: false,
    model: false,
    price: false,
    year: false,
    'group-by': false,
  };
};

const showAll = () => {
  columnVisibility.value = {};
};

const onColumnVisibilityChange = (
  visibility: InfiniteTablePropColumnVisibility,
) => {
  columnVisibility.value = visibility;
};

const groupBy = [
  {
    field: 'make' as const,
  },
];

const defaultColumnPinning = {
  'group-by': true as const,
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
  <button @click="hideAll">hide all</button>
  <button @click="showAll">show all</button>
  <DataSource primaryKey="id" :data="rowData" :groupBy="groupBy">
    <InfiniteTable
      :domProps="domProps"
      :defaultColumnPinning="defaultColumnPinning"
      :columnVisibility="columnVisibility"
      :onColumnVisibilityChange="onColumnVisibilityChange"
      groupRenderStrategy="single-column"
      :columns="columns"
      :groupColumn="groupColumn"
    />
  </DataSource>
</template>

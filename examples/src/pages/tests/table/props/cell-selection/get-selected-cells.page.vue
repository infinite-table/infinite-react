<script setup lang="ts">
import { ref } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type {
  InfiniteTablePropColumns,
  InfiniteTableApi,
  DataSourcePropCellSelection_MultiCell,
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

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers10')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },

  firstName: {
    field: 'firstName',
  },

  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
};

const domProps = {
  style: {
    height: '80vh',
    margin: '10px',
  },
};

const _api = ref<InfiniteTableApi<Developer> | null>(null);

const cellSelection: DataSourcePropCellSelection_MultiCell = {
  selectedCells: [
    [2, 'id'],
    [8, 'preferredLanguage'],
    [5, 'stack'],
  ],
  deselectedCells: [[3, 'stack']],
  defaultSelection: false,
};

const onReady = ({ api }: { api: InfiniteTableApi<Developer> }) => {
  _api.value = api;
};
</script>

<template>
  <DataSource
    primaryKey="id"
    :data="dataSource"
    selectionMode="multi-cell"
    :defaultCellSelection="cellSelection"
  >
    <InfiniteTable
      :onReady="onReady"
      :domProps="domProps"
      :columns="columns"
      :keyboardSelection="true"
      keyboardNavigation="cell"
      :columnDefaultWidth="200"
    />
  </DataSource>
</template>

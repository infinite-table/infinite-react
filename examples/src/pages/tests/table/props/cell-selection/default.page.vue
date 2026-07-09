<script setup lang="ts">
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type {
  InfiniteTablePropColumns,
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
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
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

const cellSelection: DataSourcePropCellSelection_MultiCell = {
  selectedCells: [
    // [2, 'firstName'],
    ['*', 'firstName'],
    // [7, 'preferredLanguage'],
    // [3, 'id'],
    [3, '*'],
    [4, '*'],
    [5, '*'],
    [11, 'preferredLanguage'],
    [15, 'stack'],
  ],
  // deselectedCells: [[3, 'stack']],
  defaultSelection: false,
};

const columnPinning = {
  // firstName: 'start',
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
      :columnPinning="columnPinning"
      debugId="test"
      :domProps="domProps"
      :columns="columns"
      :keyboardSelection="true"
      keyboardNavigation="cell"
      :columnDefaultWidth="200"
    />
  </DataSource>
</template>

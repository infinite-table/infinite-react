<!--
  Code shown on the Vue version of the "Using Context Menus" page: the sibling
  of using-context-menus.snippet.tsx, for the region that is not the same code
  in Vue. Type-checked with vue-tsc against the current source.

  The regions that are the same code in React and Vue are shown from the .tsx
  file (the fences marked `neutral` in the page).
-->
<script setup lang="ts">
import {
  DataSource,
  InfiniteTable,
  type InfiniteTablePropColumns,
  type InfiniteTablePropGetCellContextMenuItems,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  age: number;
  currency: string;
};

declare const data: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;

//#region intro
const getCellContextMenuItems: InfiniteTablePropGetCellContextMenuItems<Developer> = ({ column, value }) => {
  if (column.id === 'currency') {
    return [
      {
        label: `Convert ${value}`,
        key: 'currency-convert',
      },
    ];
  }

  if (column.id === 'age') {
    return null;
  }

  return [
    {
      label: `Welcome ${value}`,
      key: 'hi',
    },
  ];
};

// <DataSource :data="data" primaryKey="id">
//   <InfiniteTable
//     :getCellContextMenuItems="getCellContextMenuItems"
//     :columns="columns"
//   />
// </DataSource>
//#endregion
</script>

<template>
  <DataSource :data="data" primaryKey="id">
    <InfiniteTable
      :getCellContextMenuItems="getCellContextMenuItems"
      :columns="columns"
    />
  </DataSource>
</template>

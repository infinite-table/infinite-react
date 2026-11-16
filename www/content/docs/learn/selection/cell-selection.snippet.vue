<!--
  Code shown on the Vue version of the "Cell Selection" page: the sibling of
  cell-selection.snippet.tsx, with the same `#region` names. Type-checked
  with vue-tsc against the current source.

  The regions that are the same code in React and Vue are shown from the .tsx
  file (the fences marked `neutral` in the page).
-->
<script setup lang="ts">
import {
  DataSource,
  type DataSourcePropCellSelection_MultiCell,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  stack: string;
};

declare const data: Developer[];

//#region using-default-selection
const defaultCellSelection: DataSourcePropCellSelection_MultiCell = {
  defaultSelection: false,
  selectedCells: [
    [3, 'stack'], // rowId + colId
    [5, 'stack'], // rowId + colId
    [0, 'firstName'], // rowId + colId
  ],
};

// <DataSource
//   primaryKey="id"
//   :data="data"
//   selectionMode="multi-cell"
//   :defaultCellSelection="defaultCellSelection"
// />
//#endregion
</script>

<template>
  <!-- #region configuring-the-selection-mode -->
  <DataSource primaryKey="id" :data="data" selectionMode="multi-cell" />

  <!-- can be "single-row", "multi-row", "multi-cell" or false -->
  <!-- #endregion -->

  <DataSource
    primaryKey="id"
    :data="data"
    selectionMode="multi-cell"
    :defaultCellSelection="defaultCellSelection"
  />
</template>

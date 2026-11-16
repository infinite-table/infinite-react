<!--
  Code shown on the Vue version of the "Row Selection" page: the sibling of
  row-selection.snippet.tsx, with the same `#region` names. Type-checked
  with vue-tsc against the current source.

  The regions that are the same code in React and Vue are shown from the .tsx
  file (the fences marked `neutral` in the page).
-->
<script setup lang="ts">
import {
  DataSource,
  InfiniteTable,
  type DataSourcePropFilterFunction,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  country: string;
  preferredLanguage: string;
};

declare const data: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;
declare const columnsWithACheckboxColumn: InfiniteTablePropColumns<Developer>;

//#region selecting-all-rows-when-the-data-is-filtered
const filterFunction: DataSourcePropFilterFunction<Developer> = ({ data }) =>
  data.preferredLanguage === 'TypeScript';

// <DataSource
//   primaryKey="id"
//   :data="data"
//   selectionMode="multi-row"
//   multiRowSelectionTarget="visible" // #highlight
//   :filterFunction="filterFunction"
// />
//#endregion
</script>

<template>
  <!-- #region configure-the-selection-mode-on-the-datasource -->
  <DataSource primaryKey="id" :data="data" selectionMode="single-row" />

  <!-- can be "single-row", "multi-row", "multi-cell" or false -->
  <!-- #endregion -->

  <!-- #region single-row-selection -->
  <!-- #highlight -->
  <DataSource primaryKey="id" :data="data" :defaultRowSelection="4">
    <InfiniteTable :columns="columns" />
  </DataSource>
  <!-- #endregion -->

  <!-- #region choosing-how-users-select-rows -->
  <DataSource selectionMode="multi-row" primaryKey="id" :data="data">
    <!-- #highlight -->
    <InfiniteTable multiRowSelectionWith="click" :columns="columnsWithACheckboxColumn" />
  </DataSource>
  <!-- #endregion -->

  <DataSource
    primaryKey="id"
    :data="data"
    selectionMode="multi-row"
    multiRowSelectionTarget="visible"
    :filterFunction="filterFunction"
  />
</template>

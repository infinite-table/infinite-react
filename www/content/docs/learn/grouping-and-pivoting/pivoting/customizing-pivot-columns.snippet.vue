<!--
  Code shown on the Vue version of the "Customizing Pivot Columns" page: the
  sibling of customizing-pivot-columns.snippet.tsx, with the same `#region`
  names. The regions that are the same code for React and Vue are not repeated
  here: their fences are marked `neutral` in the page. Type-checked with
  vue-tsc against the current source.
-->
<script setup lang="ts">
import {
  InfiniteTable,
  type InfiniteTablePropColumns,
  type InfiniteTableProps,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  country: string;
  preferredLanguage: string;
  canDesign: 'yes' | 'no';
  license: string;
  age: number;
  salary: number;
};

declare const columns: InfiniteTablePropColumns<Developer>;

//#region pivot-column-function
// <InfiniteTable :columns="columns" :pivotColumn="pivotColumn" />
const pivotColumn: InfiniteTableProps<Developer>['pivotColumn'] = ({
  column,
}) => ({
  defaultSortable: !column.pivotTotalColumn,
});
//#endregion
</script>

<template>
  <!-- #region global-the-pivotcolumn-prop -->
  <InfiniteTable
    :columns="columns"
    :pivotColumn="{
      defaultSortable: true,
      defaultWidth: 180,
    }"
  />
  <!-- #endregion -->

  <InfiniteTable :columns="columns" :pivotColumn="pivotColumn" />
</template>

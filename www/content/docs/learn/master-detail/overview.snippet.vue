<!--
  Code shown on the Vue version of the "Master Detail" page: the sibling of
  overview.snippet.tsx, with the same `#region` names. Type-checked with
  vue-tsc against the current source.
-->
<script setup lang="ts">
import { h } from 'vue';
import type { VNode } from 'vue';
import {
  DataSource,
  InfiniteTable,
  type DataSourceData,
  type InfiniteTablePropColumns,
  type InfiniteTableRowInfo,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  city: string;
  country: string;
};

type City = {
  id: number;
  cityName: string;
  country: string;
};

declare const masterColumns: InfiniteTablePropColumns<City>;
declare function renderDetail(rowInfo: InfiniteTableRowInfo<City>): VNode;

//#region loading-the-detail-datagrid-data
const detailDataFn: DataSourceData<Developer> = ({
  masterRowInfo, // #highlight
  sortInfo,
  // ...
}) => {

  return Promise.resolve([/* ... */])
}

// the detail DataSource, as rendered by the `rowDetailRenderer` function
h(DataSource, { data: detailDataFn, primaryKey: 'id' }, () => [
  /* ... */
]);
//#endregion

//#region using-conditional-row-details
const isRowDetailEnabled = (rowInfo: InfiniteTableRowInfo<City>) =>
  rowInfo.data?.cityName?.includes('i') ?? false;

// <InfiniteTable
//   :columns="masterColumns"
//   :rowDetailHeight="500"
//   :rowDetailRenderer="renderDetail"
//   :isRowDetailEnabled="isRowDetailEnabled" // #highlight
// />
//#endregion
</script>

<template>
  <!-- #region configuring-the-row-detail-height -->
  <!-- #highlight -->
  <InfiniteTable :columns="masterColumns" :rowDetailHeight="500" :rowDetailRenderer="renderDetail" />
  <!-- #endregion -->

  <InfiniteTable
    :columns="masterColumns"
    :rowDetailHeight="500"
    :rowDetailRenderer="renderDetail"
    :isRowDetailEnabled="isRowDetailEnabled"
  />
</template>

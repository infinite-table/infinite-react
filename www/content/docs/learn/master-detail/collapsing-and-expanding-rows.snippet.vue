<!--
  Code shown on the Vue version of the "Master Detail - Collapsing and
  Expanding Rows" page: the sibling of collapsing-and-expanding-rows.snippet.tsx,
  for the regions that are not the same code in Vue. Type-checked with vue-tsc
  against the current source.
-->
<script setup lang="ts">
import { h, ref } from 'vue';
import type { VNode } from 'vue';
import {
  DataSource,
  InfiniteTable,
  type DataSourceProps,
  type InfiniteTablePropColumns,
  type InfiniteTableRowInfo,
  type RowDetailStateObject,
} from '@infinite-table/infinite-vue';

type DATA_TYPE = {
  id: number;
  name: string;
  country: string;
};

declare const columns: InfiniteTablePropColumns<DATA_TYPE>;
declare const masterColumns: InfiniteTablePropColumns<DATA_TYPE>;
declare const dataSourceProps: DataSourceProps<DATA_TYPE>;
declare function renderDetail(rowInfo: InfiniteTableRowInfo<DATA_TYPE>): VNode;

//#region specyfing-the-default-row-detail-state
const defaultRowDetailState: RowDetailStateObject = {
  collapsedRows: true,
  expandedRows: [39, 54],
};

// <InfiniteTable
//   :columns="columns"
//   :defaultRowDetailState="defaultRowDetailState" // #highlight
//   :rowDetailRenderer="renderDetail"
// />
//#endregion

//#region passing-an-instance-of-rowdetailstate-to-the
import { RowDetailState } from '@infinite-table/infinite-vue';

const rowDetailState = new RowDetailState({
  collapsedRows: true,
  expandedRows: [2, 3, 4],
});

// <InfiniteTable :columns="columns" :rowDetailState="rowDetailState" />
//#endregion

function onRowDetailStateChangeListener() {
  //#region using-the-onrowdetailstatechange-listener
  const rowDetailState = ref<RowDetailStateObject>({
    collapsedRows: true as const,
    expandedRows: [39, 54],
  });

  const onRowDetailStateChange = (rowDetailStateInstance: RowDetailState) => {
    rowDetailState.value = rowDetailStateInstance.getState(); // #highlight
  };

  // <DataSource v-bind="dataSourceProps">
  //   <InfiniteTable
  //     :rowDetailState="rowDetailState"
  //     :onRowDetailStateChange="onRowDetailStateChange"
  //     :columnMinWidth="50"
  //     :columns="masterColumns"
  //     :rowDetailHeight="200"
  //     :rowDetailRenderer="renderDetail"
  //   />
  // </DataSource>
  //#endregion
  return { rowDetailState, onRowDetailStateChange };
}

function expandAndCollapseAll() {
  //#region listening-to-row-detail-state-changes
  const rowDetailState = ref<RowDetailStateObject>({
    collapsedRows: true,
    expandedRows: [39, 54],
  });

  const expandAll = () => {
    rowDetailState.value = {
      collapsedRows: [],
      expandedRows: true,
    };
  };
  const collapseAll = () => {
    rowDetailState.value = {
      collapsedRows: true,
      expandedRows: [],
    };
  };

  // <button @click="expandAll">Expand All</button>
  // <button @click="collapseAll">Collapse All</button>
  // <InfiniteTable :columns="columns" :rowDetailState="rowDetailState" />
  //#endregion
  return { rowDetailState, expandAll, collapseAll };
}

// the commented templates above, as real elements in the template below
const listener = onRowDetailStateChangeListener();
const all = expandAndCollapseAll();
</script>

<template>
  <InfiniteTable
    :columns="columns"
    :defaultRowDetailState="defaultRowDetailState"
    :rowDetailRenderer="renderDetail"
  />

  <InfiniteTable :columns="columns" :rowDetailState="rowDetailState" />

  <!-- #region passing-an-object-literal-to-the-infinitetable -->
  <InfiniteTable
    :columns="columns"
    :rowDetailState="{
      collapsedRows: true,
      expandedRows: [2, 3, 4],
    }"
  />
  <!-- #endregion -->

  <DataSource v-bind="dataSourceProps">
    <InfiniteTable
      :rowDetailState="listener.rowDetailState.value"
      :onRowDetailStateChange="listener.onRowDetailStateChange"
      :columnMinWidth="50"
      :columns="masterColumns"
      :rowDetailHeight="200"
      :rowDetailRenderer="renderDetail"
    />
  </DataSource>

  <button @click="all.expandAll">Expand All</button>
  <button @click="all.collapseAll">Collapse All</button>
  <InfiniteTable :columns="columns" :rowDetailState="all.rowDetailState.value" />
</template>

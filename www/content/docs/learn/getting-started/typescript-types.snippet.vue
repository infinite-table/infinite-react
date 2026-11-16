<!--
  Code shown on the Vue version of the "TypeScript Types" page: the sibling of
  typescript-types.snippet.tsx, with the same `#region` names. Type-checked
  with vue-tsc against the current source.
-->
<script setup lang="ts">
//#region importing-infinitetable-and-datasource
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
//#endregion

declare const data: Developer[];

//#region generic-components
type Developer = {
  id: number;

  firstName: string;
  lastName: string;

  currency: string;
  salary: number;
};

// the type of the `columns` prop, bound to the type of the data
const columns: InfiniteTablePropColumns<Developer> = {
  firstName: { field: 'firstName' },
  salary: { field: 'salary', type: 'number' },
};

// <DataSource :data="data" primaryKey="id">
//   <InfiniteTable :columns="columns" />
// </DataSource>
//#endregion

//#region prop-types
import type {
  InfiniteTablePropColumns,
  // corresponding to the `columns` prop
  DataSourcePropGroupBy,
  // corresponding to the `groupBy` prop
} from '@infinite-table/infinite-vue';
//#endregion

//#region aggregation-reducers-type
import type { DataSourcePropAggregationReducers } from '@infinite-table/infinite-vue';
//#endregion

//#region row-style-type
import type { InfiniteTablePropRowStyle } from '@infinite-table/infinite-vue';
//#endregion

//#region column-groups-type
import type { InfiniteTablePropColumnGroups } from '@infinite-table/infinite-vue';
//#endregion
</script>

<template>
  <DataSource :data="data" primaryKey="id">
    <InfiniteTable :columns="columns" />
  </DataSource>
</template>

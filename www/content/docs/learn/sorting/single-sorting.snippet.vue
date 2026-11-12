<!--
  Code shown on the Vue version of the "Single Sorting" page: the sibling of
  single-sorting.snippet.tsx, with the same `#region` names. Type-checked
  with vue-tsc against the current source.
-->
<script setup lang="ts">
import {
  DataSource,
  InfiniteTable,
  type DataSourcePropSortFn,
  type DataSourcePropSortInfo,
  type DataSourcePropSortTypes,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  age: number;
  color: string;
};

declare const data: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;

let sortInfo: DataSourcePropSortInfo<Developer>;

//#region default-sort-info
// sort by `firstName`, in ascending order
const defaultSortInfo = { field: 'firstName', dir: 1 };
//#endregion

//#region sort-info
// sort by `firstName`, in ascending order
sortInfo = { field: 'firstName', dir: 1 };
//#endregion

//#region no-sort
// no sorting
sortInfo = null;
//#endregion

//#region multiple
// sort by age in descending order, then by `firstName` in ascending order
sortInfo = [
  { field: 'age', type: 'number', dir: -1 },
  { field: 'firstName', dir: 1 },
];

// no sorting
sortInfo = [];
//#endregion

//#region default-sort-types
const sortTypes: DataSourcePropSortTypes = {
  string: (a, b) => a.localeCompare(b),
  number: (a, b) => a - b,
};
//#endregion

const colorOrder = ['magenta', 'blue', 'green'];

//#region default-sort-info-with-type
// <DataSource :defaultSortInfo="defaultSortInfoByColor" />
const defaultSortInfoByColor: DataSourcePropSortInfo<Developer> = {
  field: 'color',
  dir: 1,
  // note this custom sort type
  type: 'color', // #highlight
};
//#endregion

//#region color-sort-type
// <DataSource :sortTypes="colorSortTypes" />
const colorSortTypes: DataSourcePropSortTypes = {
  ...sortTypes,
  color: (a: string, b: string) => colorOrder.indexOf(a) - colorOrder.indexOf(b),
};
//#endregion

//#region sort-function
const sortFunction: DataSourcePropSortFn<Developer> = (sortInfo, dataArray) => {
  // sort the dataArray according to the sortInfo
  // and return the sorted array
  return [...dataArray].sort((a, b) => {
    for (const { field, dir } of sortInfo) {
      const key = field as keyof Developer;
      if (a[key] !== b[key]) return (a[key] < b[key] ? -1 : 1) * dir;
    }
    return 0;
  });
};
// <DataSource primaryKey="id" :data="data" :sortFunction="sortFunction" />
//#endregion
</script>

<template>
  <!-- #region uncontrolled -->
  <!--
    initially render the component with ascending sorting on `firstName` field
    also, note this is an array, so multiple sorting will be enabled
  -->
  <DataSource
    primaryKey="id"
    :data="data"
    :defaultSortInfo="[{ field: 'firstName', dir: 1 }]"
  >
    <InfiniteTable :columns="columns" />
  </DataSource>
  <!-- #endregion -->

  <DataSource
    primaryKey="id"
    :data="data"
    :sortInfo="sortInfo"
    :defaultSortInfo="defaultSortInfo"
  />
  <DataSource
    primaryKey="id"
    :data="data"
    :defaultSortInfo="defaultSortInfoByColor"
    :sortTypes="colorSortTypes"
  />
  <DataSource primaryKey="id" :data="data" :sortFunction="sortFunction" />
</template>

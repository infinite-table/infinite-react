<!--
  Code shown on the Vue version of the "Sorting and Filtering the Data
  Yourself" page: the sibling of
  sorting-and-filtering-the-data-yourself.snippet.tsx, with the same `#region`
  names. Type-checked with vue-tsc against the current source.
-->
<script setup lang="ts">
import { ref } from 'vue';
import {
  DataSource,
  type DataSourcePropFilterValue,
  type DataSourceSingleSortInfo,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  country: string;
  age: number;
};

declare const rows: Developer[];

const sortInfo = ref<DataSourceSingleSortInfo<Developer>[]>([]);
const filterValue = ref<DataSourcePropFilterValue<Developer>>([]);

const onSortInfoChange = (value: DataSourceSingleSortInfo<Developer>[]) => {
  sortInfo.value = value;
};
const onFilterValueChange = (value: DataSourcePropFilterValue<Developer>) => {
  filterValue.value = value;
};

//#region intro
const shouldReloadData = { sortInfo: true, filterValue: true };

// <DataSource
//   primaryKey="id"
//   :data="rows"
//   :sortInfo="sortInfo"
//   :onSortInfoChange="onSortInfoChange"
//   :filterValue="filterValue"
//   :onFilterValueChange="onFilterValueChange"
//   :shouldReloadData="shouldReloadData"
// />
//#endregion

//#region reusing-the-built-in-sorting-and-filtering
import {
  defaultFilterFunction,
  defaultFilterTypes,
  multisort,
} from '@infinite-table/infinite-vue';

function sortAndFilter(
  rows: Developer[],
  sortInfo: DataSourceSingleSortInfo<Developer>[],
  filterValue: DataSourcePropFilterValue<Developer>,
) {
  const filtered = rows.filter((data, index, dataArray) =>
    defaultFilterFunction({
      data,
      index,
      dataArray,
      primaryKey: data.id,
      filterValue,
      filterTypes: defaultFilterTypes,
    }),
  );
  return multisort(sortInfo, filtered);
}
//#endregion
</script>

<template>
  <DataSource
    primaryKey="id"
    :data="rows"
    :sortInfo="sortInfo"
    :onSortInfoChange="onSortInfoChange"
    :filterValue="filterValue"
    :onFilterValueChange="onFilterValueChange"
    :shouldReloadData="shouldReloadData"
  />
</template>

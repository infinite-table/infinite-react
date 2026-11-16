<!--
  Code shown on the Vue version of the pivoting "Overview" page: the sibling of
  overview.snippet.tsx, with the same `#region` names. The regions that are the
  same code for React and Vue are not repeated here: their fences are marked
  `neutral` in the page. Type-checked with vue-tsc against the current source.
-->
<script setup lang="ts">
import {
  DataSource,
  InfiniteTable,
  type DataSourceData,
  type DataSourceDataParams,
  type DataSourcePivotBy,
  type DataSourceRemoteData,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  // `team` and `department` are the fields of the `intro` region
  team: string;
  department: string;
  country: string;
  city: string;
  stack: string;
  preferredLanguage: string;
  canDesign: 'yes' | 'no';
  age: number;
  salary: number;
};

declare const data: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;

type DATA_TYPE = Developer;

//#region pivot-by-column-object
const pivotBy: DataSourcePivotBy<DATA_TYPE>[] = [
  { field: 'country' },
  { field: 'canDesign', column: { defaultWidth: 400 } },
];

// <DataSource primaryKey="id" :data="data" :pivotBy="pivotBy" />
//#endregion

declare function fetchPivotData(
  params: Pick<
    DataSourceDataParams<Developer>,
    'groupBy' | 'pivotBy' | 'groupKeys' | 'aggregationReducers'
  >,
): Promise<DataSourceRemoteData<Developer>>;

//#region server-side-pivoting-data-function

const dataSource: DataSourceData<Developer> = ({ groupBy, pivotBy, groupKeys, aggregationReducers }) => {
  // make sure you return a Promise that resolves to the correct structure - see details below

  //eg: groupBy: [{ field: 'country' }, { field: 'stack' }],
  //    groupKeys: [], - so we're requesting top-level data

  //eg: groupBy: [{ field: 'country' }, { field: 'stack' }],
  //    groupKeys: ["Canada"], - so we're requesting Canada's data

  //eg: groupBy: [{ field: 'country' }, { field: 'stack' }],
  //    groupKeys: ["Canada"], - so we're requesting Canada's data

  return fetchPivotData({ groupBy, pivotBy, groupKeys, aggregationReducers });
}

// <DataSource primaryKey="id" :lazyLoad="true" :data="dataSource" />
//#endregion
</script>

<template>
  <!-- #region intro -->
  <!-- field needs to be keyof DATA_TYPE both in `pivotBy` and `groupBy` -->
  <DataSource
    primaryKey="id"
    :data="data"
    :pivotBy="[{ field: 'team' }]"
    :groupBy="[{ field: 'department' }, { field: 'country' }]"
  >
    <template #default="{ pivotColumns, pivotColumnGroups }">
      <InfiniteTable
        :columns="columns"
        :pivotColumns="pivotColumns"
        :pivotColumnGroups="pivotColumnGroups"
      />
    </template>
  </DataSource>
  <!-- #endregion -->

  <!-- #region pivot-column-default-sortable -->
  <InfiniteTable
    :columns="columns"
    :pivotColumn="{
      defaultSortable: true,
    }"
  />
  <!-- #endregion -->

  <DataSource primaryKey="id" :data="data" :pivotBy="pivotBy" />
  <DataSource primaryKey="id" :lazyLoad="true" :data="dataSource" />
</template>

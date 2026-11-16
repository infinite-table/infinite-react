<!--
  Snippets shown on the Vue version of index.page.md: the sibling of
  index.snippet.tsx, with the same `#region` names. Type-checked with
  vue-tsc against the library source (`npm run tsc:vue`).
-->
<script setup lang="ts">
import {
  DataSource,
  InfiniteTable,
  type DataSourcePropFilterValue,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  age: number;
  salary: number;
};

declare const data: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;

//#region filtering-columns-not-bound-to-a-field
// <DataSource :defaultFilterValue="defaultFilterValue" />
const defaultFilterValue: DataSourcePropFilterValue<Developer> = [
  {
    id: 'salary',
    valueGetter: ({ data }) => data.salary,
    filter: {
      operator: 'gt',
      value: '',
      type: 'number',
    },
  },
];
//#endregion
</script>

<template>
  <!-- #region specifying-an-initial-filter-value-for-the -->
  <DataSource
    primaryKey="id"
    :data="data"
    :defaultFilterValue="[
      {
        field: 'age',
        filter: {
          operator: 'gt',
          value: 30,
          type: 'number',
        },
      },
    ]"
  >
    <InfiniteTable :columns="columns" />
  </DataSource>
  <!-- #endregion -->

  <DataSource
    primaryKey="id"
    :data="data"
    :defaultFilterValue="defaultFilterValue"
  />
</template>

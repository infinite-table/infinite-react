<!--
  Code shown on the Vue version of the "Grouping rows" page: the sibling of
  grouping-rows.snippet.tsx, with the same `#region` names. Type-checked
  with vue-tsc against the current source.

  The regions that are the same code in React and Vue are shown from the .tsx
  file (the fences marked `neutral` in the page).
-->
<script setup lang="ts">
import {
  DataSource,
  InfiniteTable,
  type DataSourcePropGroupBy,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-vue';

//#region intro
type Person = {
  name: string;
  age: number;
  country: string;
  id: string;
}

const groupBy: DataSourcePropGroupBy<Person> = [{field: 'country'}];

// <DataSource primaryKey="id" :data="data" :groupBy="groupBy">
//   <InfiniteTable :columns="columns" />
// </DataSource>
//#endregion

declare const data: Person[];
declare const columns: InfiniteTablePropColumns<Person>;

type Developer = {
  id: number;
  firstName: string;
  companyName: string;
  country: string;
  city: string;
  stack: string;
  age: number;
  salary: number;
};

function groupByColumnRenderValue() {
  //#region group-by-column-render-value
  const groupBy: DataSourcePropGroupBy<Person> = [
    {
      field: 'country',
      column: {
        renderValue: ({ value }) => `Country: ${value}`, // #highlight
      },
    },
  ];
  //#endregion
  return groupBy;
}

function multipleGroupColumns() {
  //#region multiple-groups-columns
  const groupBy: DataSourcePropGroupBy<Developer> = [
    {
      field: 'age',
      column: {
        defaultWidth: 100,
        renderValue: ({ value }) => `Age: ${value}`,
      },
    },
    {
      field: 'companyName',
    },
    {
      field: 'country',
    },
  ];
  //#endregion
  return groupBy;
}

const groupByWithRenderValue = groupByColumnRenderValue();
const multipleGroupBy = multipleGroupColumns();

declare const developers: Developer[];
declare const developerColumns: InfiniteTablePropColumns<Developer>;
</script>

<template>
  <DataSource primaryKey="id" :data="data" :groupBy="groupBy">
    <InfiniteTable :columns="columns" />
  </DataSource>

  <DataSource primaryKey="id" :data="data" :groupBy="groupByWithRenderValue">
    <InfiniteTable :columns="columns" />
  </DataSource>

  <DataSource primaryKey="id" :data="developers" :groupBy="multipleGroupBy">
    <InfiniteTable :columns="developerColumns" />
  </DataSource>
</template>

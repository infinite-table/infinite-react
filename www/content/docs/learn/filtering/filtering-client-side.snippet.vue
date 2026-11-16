<!--
  Snippets shown on the Vue version of filtering-client-side.page.md: the
  sibling of filtering-client-side.snippet.tsx, with the same `#region` names.
  Type-checked with vue-tsc against the library source (`npm run tsc:vue`).
-->
<script setup lang="ts">
import { h } from 'vue';
import {
  DataSource,
  type DataSourceFilterType,
  type DataSourcePropFilterFunction,
  type DataSourcePropFilterTypes,
  type DataSourcePropFilterValue,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  age: number;
  salary: number;
};

declare const data: Developer[];

//#region using-filter-types-for-filtervalue
// <DataSource :filterValue="filterValue" />
const filterValue: DataSourcePropFilterValue<Developer> = [
  {
    field: 'firstName',
    filter: {
      type: 'string', // #highlight
      operator: 'includes',
      value: 'John',
    },
  },
  {
    field: 'age',
    filter: {
      type: 'number', // #highlight
      operator: 'gt',
      value: 30,
    },
  },
];
//#endregion

const IncludesOperatorIcon = () => h('span', '⊃');

const stringFilterType: DataSourceFilterType<Developer> = {
  label: 'Text',
  emptyValues: [''],
  defaultOperator: 'includes',
  //#region using-filter-types
  operators: [
    {
      name: 'includes',
      components: { Icon: IncludesOperatorIcon /* a Vue component */ },
      label: 'Includes',
      fn: ({ currentValue, filterValue }) => {
        return (
          typeof currentValue === 'string' &&
          typeof filterValue == 'string' &&
          currentValue.toLowerCase().includes(filterValue.toLowerCase())
        );
      },
    },
    //...
  ],
  //#endregion
};

//#region salary-filter-type
const filterTypes: DataSourcePropFilterTypes<Developer> = {
  salary: {
    defaultOperator: 'gt',
    emptyValues: ['', null, undefined],
    operators: [
      /*...*/
    ],
  },
};

// <DataSource primaryKey="id" :data="data" :filterTypes="filterTypes" />
//#endregion

//#region customizing-default-filter-types
import { defaultFilterTypes } from '@infinite-table/infinite-vue';
//#endregion

//#region using-a-filter-function-instead-of-the-column
import { defaultFilterFunction } from '@infinite-table/infinite-vue';

// the built-in column filtering
// <DataSource primaryKey="id" :data="data" :filterFunction="defaultFilterFunction" />

// your own logic only
const byId: DataSourcePropFilterFunction<Developer> = (param) =>
  param.data.id > 100;
// <DataSource primaryKey="id" :data="data" :filterFunction="byId" />

// the column filters, and your own condition
const byColumnFiltersAndId: DataSourcePropFilterFunction<Developer> = (param) =>
  defaultFilterFunction(param) && param.data.id > 100;
// <DataSource primaryKey="id" :data="data" :filterFunction="byColumnFiltersAndId" />
//#endregion

const allFilterTypes = { ...defaultFilterTypes, text: stringFilterType };
</script>

<template>
  <DataSource primaryKey="id" :data="data" :filterValue="filterValue" />
  <DataSource primaryKey="id" :data="data" :filterTypes="filterTypes" />
  <DataSource primaryKey="id" :data="data" :filterTypes="allFilterTypes" />
  <DataSource
    primaryKey="id"
    :data="data"
    :filterFunction="defaultFilterFunction"
  />
  <DataSource primaryKey="id" :data="data" :filterFunction="byId" />
  <DataSource
    primaryKey="id"
    :data="data"
    :filterFunction="byColumnFiltersAndId"
  />
</template>

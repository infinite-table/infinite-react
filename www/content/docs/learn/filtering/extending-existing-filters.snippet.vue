<!--
  Snippets shown on the Vue version of extending-existing-filters.page.md: the
  sibling of extending-existing-filters.snippet.tsx, with the same `#region`
  names. Type-checked with vue-tsc against the library source (`npm run tsc:vue`).
-->
<script setup lang="ts">
import { h } from 'vue';

type Developer = {
  id: number;
  firstName: string;
  canDesign: boolean;
};

declare const data: Developer[];

const VueComponentForIcon = () => h('span', '⊅');

//#region adding-a-new-operator-to-the-string-filter-type
import { defaultFilterTypes } from '@infinite-table/infinite-vue';

// add new operators for the `string` filter type
defaultFilterTypes.string.operators.push({
  name: 'notContains',
  components: { Icon: VueComponentForIcon },
  label: 'Not Contains',
  fn: ({ currentValue, filterValue }) => {
    return (
      typeof currentValue === 'string' &&
      typeof filterValue == 'string' &&
      !currentValue.toLowerCase().includes(filterValue.toLowerCase())
    );
  },
});
//#endregion

//#region adding-a-new-filter-type-by-using-the
import {
  DataSource,
  type DataSourcePropFilterTypes,
} from '@infinite-table/infinite-vue';

const filterTypes: DataSourcePropFilterTypes<Developer> = {
  bool: {
    defaultOperator: 'eq',
    emptyValues: [null],
    operators: [
      {
        name: 'eq',
        label: 'Equals',
        fn: ({ currentValue, filterValue }) => currentValue === filterValue,
      },
    ],
  },
};

// <DataSource primaryKey="id" :data="data" :filterTypes="filterTypes" />
//#endregion
</script>

<template>
  <DataSource primaryKey="id" :data="data" :filterTypes="filterTypes" />
</template>

<!--
  Snippets shown on the Vue version of excel-like-editing.page.md: the sibling of
  excel-like-editing.snippet.tsx, with the same `#region` names (the
  `simulating-formulas-with-column-valuegetter` region is the same code for React
  and Vue, so the page shows it from the .tsx file).
  Type-checked with vue-tsc against the library source (`npm run tsc:vue`).

  The `intro` region is the whole component (`<script setup>` and `<template>`),
  so its markers are HTML comments around the two blocks.
-->
<script lang="ts">
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  salary: number;
};

declare const dataSource: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;
</script>

<!-- #region intro -->
<script setup lang="ts">
import {
  DataSource,
  InfiniteTable,
  keyboardShortcuts // #highlight
} from '@infinite-table/infinite-vue';
</script>

<template>
  <DataSource primaryKey="id" :data="dataSource">
    <InfiniteTable
      :columns="columns"
      :keyboardShortcuts="[
        keyboardShortcuts.instantEdit // #highlight
      ]"
    />
  </DataSource>
</template>
<!-- #endregion -->

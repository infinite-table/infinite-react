<!--
  Code shown on the Vue version of keyboard-shortcuts.page.md: the sibling of
  keyboard-shortcuts.instant-edit.snippet.tsx, with the same `#region` name.
  Type-checked with vue-tsc against the library source (`npm run tsc:vue`).

  The region is the whole component (`<script setup>` and `<template>`), so its
  markers are HTML comments around the two blocks.
-->
<script lang="ts">
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
};

declare const dataSource: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;
</script>

<!-- #region instant-edit -->
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

<!--
  Code shown on the Vue version of the "Disabled Rows" page: the sibling of
  disabled-rows.snippet.tsx, with the same `#region` names. Type-checked
  with vue-tsc against the current source.

  The regions that are the same code in React and Vue are shown from the .tsx
  file (the fences marked `neutral` in the page).
-->
<script setup lang="ts">
import {
  DataSource,
  InfiniteTable,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-vue';

type DATA_TYPE = {
  id: string;
  firstName: string;
};

declare const columns: InfiniteTablePropColumns<DATA_TYPE>;
</script>

<template>
  <!-- #region intro -->
  <DataSource
    primaryKey="id"
    :data="[]"
    :defaultRowDisabledState="{
      enabledRows: true,
      disabledRows: ['id1', 'id4', 'id5'],
    }"
  >
    <InfiniteTable :columns="columns" />
  </DataSource>
  <!-- #endregion -->
</template>

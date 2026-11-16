<!--
  Code shown on the Vue version of the tree grid "overview" page: the sibling
  of overview.snippet.tsx, with the same `#region` names. Type-checked with
  vue-tsc against the current source.

  The regions that are the same code in React and Vue are shown from the .tsx
  file (the fences marked `neutral` in the page).
-->
<script setup lang="ts">
import { TreeDataSource } from '@infinite-table/infinite-vue';

type FileSystemNode = {
  id: string;
  name: string;
  children?: FileSystemNode[];
};

declare const dataSource: FileSystemNode[];
</script>

<template>
  <!-- #region using-the-nodeskey-prop-to-specify-where-the -->
  <!-- #highlight -->
  <TreeDataSource nodesKey="children" primaryKey="id" :data="dataSource" />
  <!-- #endregion -->
</template>

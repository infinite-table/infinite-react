<script setup lang="ts">
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import { columns, data, height100DomProps } from './common';

const keyboardShortcuts = [
  {
    key: 'Shift+Enter',
    handler: () => {
      (globalThis as any).working = (globalThis as any).working || 0;
      (globalThis as any).working++;
    },
  },
];
</script>

<template>
  <DataSource :data="data" primaryKey="id">
    <InfiniteTable
      :domProps="height100DomProps"
      :keyboardShortcuts="keyboardShortcuts"
      keyboardNavigation="cell"
      :columnDefaultWidth="150"
      :columns="columns"
    />
  </DataSource>
</template>

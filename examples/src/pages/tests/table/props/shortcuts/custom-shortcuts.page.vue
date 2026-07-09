<script setup lang="ts">
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import { columns, data, height100DomProps } from './common';

const combinations: number[] = [];
(globalThis as any).combinations = combinations;

function handler(index: number) {
  return () => {
    combinations[index] = combinations[index] || 0;
    combinations[index]++;
  };
}

const keyboardShortcuts = [
  {
    key: 'cmd+shift+x',
    handler: handler(0),
  },

  {
    key: 'alt+shift+arrowleft',
    handler: handler(1),
  },
  {
    key: 'Shift+PageDown',
    handler: handler(2),
  },
  {
    key: 'alt+shift+*',
    handler: handler(3),
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

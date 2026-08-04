<script setup lang="ts">
import { InfiniteTable, TreeDataSource } from '@infinite-table/infinite-vue';

import { nodes } from './default.data';
import type { FileSystemNode } from './default.data';

const columns: Record<string, any> = {
  name: {
    field: 'name',
    renderTreeIcon: true,
    renderSelectionCheckBox: true,
    renderValue: ({ value, data }: { value: any; data: FileSystemNode }) => {
      return `${value} - ${data!.id}`;
    },
  },
  type: { field: 'type' },
  sizeKB: { field: 'sizeKB' },
};

const defaultTreeExpandState = {
  defaultExpanded: true as const,
  collapsedPaths: [['8']],
};

const domProps = {
  style: {
    margin: '5px',
    height: '900px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};
</script>

<template>
  <TreeDataSource
    :data="nodes"
    primaryKey="id"
    nodesKey="children"
    selectionMode="single-row"
    defaultTreeSelection="2"
    :defaultTreeExpandState="defaultTreeExpandState"
  >
    <InfiniteTable
      :wrapRowsHorizontally="true"
      keyboardNavigation="row"
      :domProps="domProps"
      :columns="columns"
    />
  </TreeDataSource>
</template>

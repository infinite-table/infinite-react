<script setup lang="ts">
import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-vue';

import { nodes } from './default.data';
import type { FileSystemNode } from './default.data';

const columns = {
  name: {
    field: 'name' as keyof FileSystemNode,
    renderTreeIcon: true,
    renderSelectionCheckBox: true,
    renderValue: ({ value, data }: { value: any; data: FileSystemNode }) => {
      return `${value} - ${data!.id}`;
    },
  },
  type: { field: 'type' as keyof FileSystemNode },
  sizeKB: { field: 'sizeKB' as keyof FileSystemNode },
};

const defaultTreeSelection = {
  defaultSelection: false,
  selectedPaths: [
    ['1', '4', '5'],
    ['1', '3'],
  ],
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
    selectionMode="multi-row"
    :defaultTreeSelection="defaultTreeSelection"
    :defaultTreeExpandState="defaultTreeExpandState"
  >
    <TreeGrid
      :wrapRowsHorizontally="true"
      :domProps="domProps"
      :columns="columns"
    />
  </TreeDataSource>
</template>

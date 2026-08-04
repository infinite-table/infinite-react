<script setup lang="ts">
import { computed, ref } from 'vue';

import {
  TreeDataSource,
  TreeExpandState,
  TreeGrid,
} from '@infinite-table/infinite-vue';

type FileSystemNode = {
  name: string;
  type: 'file' | 'folder';
  children?: FileSystemNode[] | null;
  sizeKB?: number;
  id: string;
  collapsed?: boolean;
};

const nodes: FileSystemNode[] = [
  {
    name: 'Documents',
    type: 'folder',
    id: '1',
    children: [
      {
        name: 'report.doc',
        type: 'file',
        sizeKB: 100,
        id: '2',
      },
      {
        type: 'folder',
        name: 'pictures',
        id: '3',
        children: [
          {
            name: 'mountain.jpg',
            type: 'file',
            sizeKB: 302,
            id: '5',
          },
        ],
      },
      {
        type: 'folder',
        name: 'diverse',
        id: '4',
        children: [
          {
            name: 'beach.jpg',
            type: 'file',
            sizeKB: 2024,
            id: '6',
          },
        ],
      },
      {
        type: 'file',
        name: 'last.txt',
        id: '7',
      },
    ],
  },
];

const columns: Record<string, any> = {
  name: {
    field: 'name',
    renderTreeIcon: true,

    renderValue: ({ value, data }: { value: any; data: FileSystemNode }) => {
      return `${value} - ${data!.id}`;
    },
  },
  type: { field: 'type' },
  sizeKB: { field: 'sizeKB' },
};

const treeExpandState = new TreeExpandState({
  defaultExpanded: false,
  expandedPaths: [['1', '4', '5'], ['1']],
});

const key = ref(0);

const isNodeExpanded = computed(() => {
  // reference key so the function identity changes when key changes
  key.value;
  return (rowInfo: any) => {
    return rowInfo.data.id === '3'
      ? false
      : treeExpandState.isNodeExpanded(rowInfo.nodePath);
  };
});

const expandAll = () => {
  treeExpandState.expandAll();
  key.value = key.value + 1;
};

const onTreeExpandStateChange = (treeExpandStateValue: any) => {
  treeExpandState.update(treeExpandStateValue);
  key.value = key.value + 1;
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
  <button @click="expandAll">expand all</button>
  <TreeDataSource
    :data="nodes"
    primaryKey="id"
    nodesKey="children"
    :treeExpandState="treeExpandState"
    :onTreeExpandStateChange="onTreeExpandStateChange"
    :isNodeExpanded="isNodeExpanded"
  >
    <TreeGrid
      :wrapRowsHorizontally="true"
      :domProps="domProps"
      :columns="columns"
    />
  </TreeDataSource>
</template>

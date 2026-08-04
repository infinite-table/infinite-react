<script setup lang="ts">
import { ref } from 'vue';

import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-vue';

import type {
  TreeSelectionValue,
  TreeExpandStateValue,
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
    renderSelectionCheckBox: true,
    renderValue: ({ value, data }: { value: any; data: FileSystemNode }) => {
      return `${value} - ${data!.id}`;
    },
  },
  type: { field: 'type' },
  sizeKB: { field: 'sizeKB' },
};

const treeSelectionState = ref<TreeSelectionValue>({
  defaultSelection: false,
  selectedPaths: [
    ['1', '4', '5'],
    ['1', '3'],
  ],
});

const treeExpandState = ref<TreeExpandStateValue>({
  defaultExpanded: true,
  collapsedPaths: [],
});

const onTreeSelectionChange = (selection: TreeSelectionValue) => {
  treeSelectionState.value = selection;
};

const onTreeExpandStateChange = (expandState: TreeExpandStateValue) => {
  console.log('expandState', expandState);
  treeExpandState.value = expandState;
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
    :treeSelection="treeSelectionState"
    :onTreeSelectionChange="onTreeSelectionChange"
    :treeExpandState="treeExpandState"
    :onTreeExpandStateChange="onTreeExpandStateChange"
  >
    <TreeGrid
      :wrapRowsHorizontally="true"
      :domProps="domProps"
      :columns="columns"
    />
  </TreeDataSource>
</template>

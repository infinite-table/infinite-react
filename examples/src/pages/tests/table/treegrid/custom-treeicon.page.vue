<script setup lang="ts">
import { h } from 'vue';

import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-vue';

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
        collapsed: true,
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
    renderTreeIcon: ({
      rowInfo,
      toggleCurrentTreeNode,
    }: {
      rowInfo: any;
      toggleCurrentTreeNode: () => void;
    }) => {
      return h(
        'div',
        {
          class: 'custom-tree-icon',
          'data-type': rowInfo.isParentNode ? 'parent' : 'leaf',
          'data-path': rowInfo.nodePath.join('/'),
          style: { width: '24px', display: 'inline-block', cursor: 'pointer' },
          onClick: toggleCurrentTreeNode,
        },
        rowInfo.isParentNode ? (rowInfo.nodeExpanded ? '👇' : '👉') : '🔴',
      );
    },
    renderValue: ({ value, data }: { value: any; data: FileSystemNode }) => {
      return `${value} - ${data!.id}`;
    },
  },
  type: { field: 'type' },
  sizeKB: { field: 'sizeKB' },
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
  <TreeDataSource :data="nodes" primaryKey="id">
    <TreeGrid :domProps="domProps" :columns="columns" />
  </TreeDataSource>
</template>

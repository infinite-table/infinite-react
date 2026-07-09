<script setup lang="ts">
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
        type: 'folder',
        name: 'misc',
        id: '4',
        collapsed: true,
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

const isNodeExpanded = ({ data }: { data: FileSystemNode }) =>
  data.collapsed !== true;

const onTreeExpandStateChange = (
  _treeExpandState: any,
  {
    dataSourceApi,
    nodePath,
    nodeState,
  }: { dataSourceApi: any; nodePath: any; nodeState: any },
) => {
  if (nodePath) {
    const data = dataSourceApi.treeApi.getNodeDataByPath(nodePath)!;

    data.collapsed = nodeState === 'collapsed' ? true : false;
  }
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
    :isNodeExpanded="isNodeExpanded"
    :onTreeExpandStateChange="onTreeExpandStateChange"
  >
    <TreeGrid
      :wrapRowsHorizontally="true"
      :domProps="domProps"
      :columns="columns"
    />
  </TreeDataSource>
</template>

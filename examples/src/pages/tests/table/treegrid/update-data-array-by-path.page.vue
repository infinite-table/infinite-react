<script setup lang="ts">
import { ref } from 'vue';

import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-vue';

import type { DataSourceApi } from '@infinite-table/infinite-vue';

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
          {
            type: 'file',
            name: 'last.txt',
            id: '7',
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

const dataSourceApi = ref<DataSourceApi<FileSystemNode> | null>(null);

const onReady = (api: DataSourceApi<FileSystemNode>) => {
  dataSourceApi.value = api;
};

const update = () => {
  dataSourceApi.value!.updateDataArrayByNodePath([
    {
      data: {
        children: undefined,
      },
      nodePath: ['1', '3'],
    },
    {
      data: {
        children: [
          {
            id: 'x',
            name: 'x',
            type: 'file',
          },
          {
            id: 'y',
            name: 'y',
            type: 'file',
          },
        ],
      },
      nodePath: ['1', '4'],
    },
  ]);
};

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};
</script>

<template>
  <div class="flex flex-col gap-2 bg-black justify-start p-10">
    <button class="bg-white text-black p-2" @click="update">Update</button>
    <TreeDataSource
      :onReady="onReady"
      :data="nodes"
      primaryKey="id"
      nodesKey="children"
      selectionMode="multi-row"
    >
      <TreeGrid
        :wrapRowsHorizontally="true"
        :domProps="domProps"
        :columns="columns"
        :columnDefaultWidth="250"
      />
    </TreeDataSource>
  </div>
</template>

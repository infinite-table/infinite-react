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
        id: '10',
      },
      {
        type: 'folder',
        name: 'pictures',
        id: '11',
        children: [
          {
            name: 'vacation.jpg',
            type: 'file',
            sizeKB: 2024,
            id: '110',
          },
          {
            name: 'island.jpg',
            type: 'file',
            sizeKB: 245,
            id: '111',
          },
        ],
      },
      {
        type: 'folder',
        name: 'diverse',
        id: '12',
        children: [
          {
            name: 'beach.jpg',
            type: 'file',
            sizeKB: 2024,
            id: '120',
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

const updateByPath = () => {
  dataSourceApi.value!.updateDataByNodePath(
    {
      name: 'my new vacation.jpg',
    },
    ['1', '11', '110'],
  );
};

const updateById = () => {
  dataSourceApi.value!.updateData({
    id: '111',
    name: 'my new island.jpg',
  });
};

const defaultTreeExpandState = {
  defaultExpanded: true as const,
  collapsedPaths: [['1', '11']],
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
    <button class="bg-white text-black p-2" @click="updateByPath">
      Update by path
    </button>

    <button class="bg-white text-black p-2" @click="updateById">
      Update by id
    </button>
    <TreeDataSource
      :onReady="onReady"
      :data="nodes"
      primaryKey="id"
      nodesKey="children"
      :defaultTreeExpandState="defaultTreeExpandState"
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

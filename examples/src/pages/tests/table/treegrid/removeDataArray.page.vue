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

const removeRowsByPrimaryKey = async () => {
  if (!dataSourceApi.value) {
    return;
  }
  const getAllData = dataSourceApi.value.getRowInfoArray();
  console.log('data source before remove', getAllData);

  const listOfPrimaryKeys = getAllData.map((row: any) => row.data.id);
  console.log('listOfPrimaryKeys', listOfPrimaryKeys);

  await dataSourceApi.value.removeDataArrayByPrimaryKeys(listOfPrimaryKeys);
  console.log(
    'data source after remove',
    dataSourceApi.value.getRowInfoArray(),
  );
};

const removeRowsByDataRow = async () => {
  if (!dataSourceApi.value) {
    return;
  }
  const getAllData = dataSourceApi.value.getRowInfoArray();
  console.log('data source before remove', getAllData);

  const listOfRows = getAllData.map((row: any) => row.data);
  console.log('listOfRows', listOfRows);
  await dataSourceApi.value.removeDataArray(listOfRows);
  console.log(
    'data source after remove',
    dataSourceApi.value.getRowInfoArray(),
  );
};

const removeById = async () => {
  if (!dataSourceApi.value) {
    return;
  }
  await dataSourceApi.value.removeDataByPrimaryKey('3');
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
  <button type="button" @click="removeRowsByPrimaryKey">
    Click to removeRowsByPrimaryKey
  </button>
  <button type="button" @click="removeRowsByDataRow">
    Click to removeRowsByDataRow
  </button>
  <button type="button" @click="removeById">Click to remove one by id</button>
  <TreeDataSource
    :onReady="onReady"
    :data="nodes"
    primaryKey="id"
    nodesKey="children"
  >
    <TreeGrid :domProps="domProps" :columns="columns" />
  </TreeDataSource>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-vue';

import type { DataSourceApi } from '@infinite-table/infinite-vue';

type FileSystemNode = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  extension?: string;
  mimeType?: string;
  sizeInKB: number;
  hierarchyPosition: number;
  children?: FileSystemNode[];
};

const columns: Record<string, any> = {
  name: {
    field: 'name',
    header: 'Name',
    renderTreeIcon: true,
    renderValue: ({ value, data }: { value: any; data: FileSystemNode }) => {
      return `${value} - ${data!.id}`;
    },
  },
  type: { field: 'type', header: 'Type' },
  extension: { field: 'extension', header: 'Extension' },
  mimeType: { field: 'mimeType', header: 'Mime Type' },
  size: { field: 'sizeInKB', type: 'number', header: 'Size (KB)' },
};

const dataSourceApi = ref<DataSourceApi<FileSystemNode> | null>(null);

const onReady = (api: DataSourceApi<FileSystemNode>) => {
  dataSourceApi.value = api;
};

const addInitialData = () => {
  dataSourceApi.value?.addDataArray(dataSource());
};

const addAndUpdateChildren = () => {
  if (!dataSourceApi.value) {
    return;
  }

  dataSourceApi.value.addData({
    id: '2',
    name: 'Desktop',
    sizeInKB: 1000,
    type: 'folder',
    hierarchyPosition: 0,
  });

  dataSourceApi.value.updateChildrenByNodePath(
    (children: FileSystemNode[] | null | undefined) => {
      return [
        ...(children ?? []),
        {
          id: '20',
          hierarchyPosition: 1,
          name: 'unknown.txt',
          sizeInKB: 100,
          type: 'file' as const,
        },
      ];
    },
    ['2'],
  );
};

const addAtEndOfNode = async () => {
  if (!dataSourceApi.value) {
    return;
  }

  dataSourceApi.value.addData({
    id: '2',
    name: 'Desktop',
    sizeInKB: 1000,
    type: 'folder',
    hierarchyPosition: 0,
  });

  dataSourceApi.value.insertData(
    {
      id: '20',
      hierarchyPosition: 1,
      name: 'unknown.txt',
      sizeInKB: 100,
      type: 'file',
    },
    {
      position: 'end',
      nodePath: ['2'],
    },
  );
  dataSourceApi.value.insertData(
    {
      id: '21',
      hierarchyPosition: 1,
      name: 'unknown2.txt',
      sizeInKB: 100,
      type: 'file',
    },
    {
      position: 'start',
      nodePath: ['2'],
    },
  );
};

const dataSource = () => {
  const nodes: FileSystemNode[] = [
    {
      id: '1',
      name: 'Documents',
      sizeInKB: 1200,
      type: 'folder',
      hierarchyPosition: 1,
      children: [
        {
          id: '10',
          name: 'Private',
          hierarchyPosition: 7,
          sizeInKB: 100,
          type: 'folder',
          children: undefined,
        },
        {
          id: '11',
          name: 'Public',
          hierarchyPosition: 2,
          sizeInKB: 100,
          type: 'folder',
          children: undefined,
        },
      ],
    },
  ];
  return nodes;
};

const emptyData: FileSystemNode[] = [];

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
  <div
    :style="{
      color: 'var(--infinite-cell-color)',
      padding: '10px',
    }"
  >
    <div :style="{ display: 'flex', gap: '10px', padding: '10px' }">
      <button @click="addInitialData">Add initial data</button>

      <button @click="addAndUpdateChildren">add &amp; update children</button>
      <button @click="addAtEndOfNode">add at the end of node</button>
    </div>
  </div>
  <TreeDataSource
    nodesKey="children"
    primaryKey="id"
    :data="emptyData"
    :onReady="onReady"
  >
    <TreeGrid :columns="columns" :domProps="domProps" />
  </TreeDataSource>
</template>

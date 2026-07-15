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

const update = async () => {
  if (!dataSourceApi.value) {
    return;
  }

  dataSourceApi.value.updateChildrenByNodePath(
    (current: FileSystemNode[] | null | undefined) => {
      return [
        ...(current || []),
        {
          name: 'new.txt',
          type: 'file' as const,
          id: '8',
        },
      ];
    },
    ['1', '3'],
  );
};

const remove = async () => {
  if (!dataSourceApi.value) {
    return;
  }

  dataSourceApi.value.updateChildrenByNodePath(() => {
    return undefined;
  }, ['1', '3']);
};

const set = async () => {
  if (!dataSourceApi.value) {
    return;
  }

  dataSourceApi.value.updateChildrenByNodePath(() => {
    return [
      {
        name: 'untitled.txt',
        type: 'file' as const,
        id: '18',
      },
    ];
  }, ['1', '2']);
};

const defaultTreeExpandState = {
  defaultExpanded: true as const,
  collapsedPaths: [['1', '3']],
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
  <button type="button" @click="update">update</button>
  <button type="button" @click="remove">remove</button>
  <button type="button" @click="set">set</button>
  <TreeDataSource
    :onReady="onReady"
    :defaultTreeExpandState="defaultTreeExpandState"
    :data="nodes"
    primaryKey="id"
    nodesKey="children"
  >
    <TreeGrid :domProps="domProps" :columns="columns" />
  </TreeDataSource>
</template>

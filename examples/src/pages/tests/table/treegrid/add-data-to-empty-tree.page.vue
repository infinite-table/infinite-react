<script setup lang="ts">
import { ref } from 'vue';

import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-vue';

import type { DataSourceApi } from '@infinite-table/infinite-vue';

import { nodes } from './default.data';
import type { FileSystemNode } from './default.data';

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

let times = 0;

const dataSourceApi = ref<DataSourceApi<FileSystemNode> | null>(null);

const onReady = (api: DataSourceApi<FileSystemNode>) => {
  dataSourceApi.value = api;
};

const addData = () => {
  if (times === 0) {
    dataSourceApi.value!.addDataArray([nodes[0]]);
  } else {
    dataSourceApi.value!.addDataArray([
      {
        id: `inserted - ${times}`,
        name: `${times}`,
        type: 'file',
        sizeKB: 100,
      },
    ]);
  }
  times++;
};

const domProps = {
  style: {
    margin: '5px',
    height: '900px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

const emptyData: FileSystemNode[] = [];
</script>

<template>
  <button @click="addData">Add data</button>
  <TreeDataSource
    :onReady="onReady"
    :data="emptyData"
    primaryKey="id"
    nodesKey="children"
  >
    <TreeGrid
      :wrapRowsHorizontally="true"
      :domProps="domProps"
      :columns="columns"
    />
  </TreeDataSource>
</template>

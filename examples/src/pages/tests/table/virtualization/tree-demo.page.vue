<script setup lang="ts">
import { ref } from 'vue';

import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-vue';

import type {
  DataSourceApi,
  InfiniteTableColumn,
} from '@infinite-table/infinite-vue';

import { FileSystemNode, nodes } from './nodes';

const columns: Record<string, InfiniteTableColumn<FileSystemNode>> = {
  name: { field: 'name', header: 'Name 0', renderTreeIcon: true },
  type: { field: 'type', header: 'Type 1' },
  extension: { field: 'extension', header: 'Extension 2' },
  mimeType: { field: 'mimeType', header: 'Mime Type 3' },
  size: { field: 'sizeInKB', type: 'number', header: 'Size (KB) 4' },
  lastModified: { field: 'lastModified', header: 'Last Modified 5' },
  owner: { field: 'owner', header: 'Owner 6' },
  permissions: { field: 'permissions', header: 'Permissions 7' },
};

const domProps = {
  style: {
    height: '284px',
    width: '575px',
  },
};

const dataSourceApi = ref<DataSourceApi<FileSystemNode> | null>(null);

const onReady = (api: DataSourceApi<FileSystemNode>) => {
  dataSourceApi.value = api;
};

const defaultTreeExpandState = {
  defaultExpanded: false as const,
  expandedPaths: [],
};

const defaultColumnPinning = { name: 'start' as const };

const dataSource = () => {
  return Promise.resolve(nodes);
};
</script>

<template>
  <TreeDataSource
    :onReady="onReady"
    nodesKey="children"
    primaryKey="id"
    :data="dataSource"
    :defaultTreeExpandState="defaultTreeExpandState"
  >
    <div style="color: var(--infinite-cell-color); padding: 10px">
      <button
        class="bg-blue-500 p-1 m-1 text-white rounded-sm"
        @click="dataSourceApi?.treeApi.expandAll()"
      >
        Expand all
      </button>
      <button
        class="bg-blue-500 p-1 m-1 text-white rounded-sm"
        @click="dataSourceApi?.treeApi.collapseAll()"
      >
        Collapse all
      </button>
    </div>

    <TreeGrid
      :columns="columns"
      :defaultColumnPinning="defaultColumnPinning"
      :domProps="domProps"
    />
  </TreeDataSource>
</template>

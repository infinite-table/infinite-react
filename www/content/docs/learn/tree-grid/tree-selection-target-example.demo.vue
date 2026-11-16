<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue';
import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-vue';
import type {
  DataSourceApi,
  DataSourcePropMultiRowSelectionTarget,
  InfiniteTableColumn,
} from '@infinite-table/infinite-vue';

type FileSystemNode = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  sizeInKB: number;
  children?: FileSystemNode[];
};

const columns: Record<string, InfiniteTableColumn<FileSystemNode>> = {
  name: {
    field: 'name',
    header: 'Name',
    renderTreeIcon: true,
    renderSelectionCheckBox: true,
  },
  type: { field: 'type', header: 'Type' },
  size: { field: 'sizeInKB', type: 'number', header: 'Size (KB)' },
};

const dataSourceApi = shallowRef<DataSourceApi<FileSystemNode> | null>();
const target = ref<DataSourcePropMultiRowSelectionTarget>('visible');
const filter = ref('.docx');

const setDataSourceApi = (api: DataSourceApi<FileSystemNode>) => {
  dataSourceApi.value = api;
};

// a new function whenever the filter text changes, so the tree is filtered again
const treeFilterFunction = computed(() => {
  const currentFilter = filter.value;

  return ({
    data,
    filterTreeNode,
  }: {
    data: FileSystemNode;
    filterTreeNode: (data: FileSystemNode) => FileSystemNode | boolean;
  }) => {
    if (!Array.isArray(data.children)) {
      return data.name.toLowerCase().includes(currentFilter.toLowerCase());
    }
    return filterTreeNode(data);
  };
});

const dataSource = () => {
  const nodes: FileSystemNode[] = [
    {
      id: '1',
      name: 'Documents',
      sizeInKB: 1200,
      type: 'folder',
      children: [
        {
          id: '10',
          name: 'Private',
          sizeInKB: 100,
          type: 'folder',
          children: [
            { id: '100', name: 'Report.docx', sizeInKB: 210, type: 'file' },
            { id: '101', name: 'Vacation.docx', sizeInKB: 120, type: 'file' },
            { id: '102', name: 'CV.pdf', sizeInKB: 108, type: 'file' },
          ],
        },
      ],
    },
    {
      id: '2',
      name: 'Desktop',
      sizeInKB: 1000,
      type: 'folder',
      children: [
        { id: '20', name: 'unknown.txt', sizeInKB: 100, type: 'file' },
        { id: '21', name: 'Notes.docx', sizeInKB: 50, type: 'file' },
      ],
    },
  ];
  return Promise.resolve(nodes);
};
</script>

<template>
  <TreeDataSource
    :onReady="setDataSourceApi"
    nodesKey="children"
    primaryKey="id"
    :data="dataSource"
    selectionMode="multi-row"
    :multiRowSelectionTarget="target"
    :treeFilterFunction="filter ? treeFilterFunction : undefined"
  >
    <div
      :style="{
        color: 'var(--infinite-cell-color)',
        padding: '10px',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
      }"
    >
      <label>
        multiRowSelectionTarget:
        <select v-model="target">
          <option value="all">all</option>
          <option value="visible">visible</option>
        </select>
      </label>
      <input placeholder="Filter files by name" v-model="filter" />
      <button @click="dataSourceApi!.treeApi.selectAll()">Select all</button>
      <button @click="dataSourceApi!.treeApi.deselectAll()">
        Deselect all
      </button>
    </div>

    <TreeGrid :columns="columns" />
  </TreeDataSource>
</template>

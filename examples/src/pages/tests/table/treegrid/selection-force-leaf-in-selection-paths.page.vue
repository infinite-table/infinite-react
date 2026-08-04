<script setup lang="ts">
import { h, ref } from 'vue';

import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-vue';

import type {
  DataSourceApi,
  TreeSelectionValue,
} from '@infinite-table/infinite-vue';

type FileSystemNode = {
  id: string;
  name: string;
  children?: FileSystemNode[];
};
const nodes: FileSystemNode[] = [
  {
    id: '1',
    name: 'Documents',
    children: [
      {
        id: '10',
        name: 'Private',
        children: [
          {
            id: '100',
            name: 'Report.docx',
          },
          {
            id: '101',
            name: 'Vacation.docx',
          },
          {
            id: '102',
            name: 'CV.pdf',
          },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Desktop',
    children: [
      {
        id: '20',
        name: 'unknown.txt',
      },
    ],
  },
  {
    id: '3',
    name: 'Media',
    children: [
      {
        id: '30',
        name: 'Music',
      },
      {
        id: '31',
        name: 'Videos',
        children: [
          {
            id: '310',
            name: 'Vacation.mp4',
          },
          {
            id: '311',
            name: 'Youtube',
            children: [
              {
                id: '3110',
                name: 'Infinity',
              },
              {
                id: '3111',
                name: 'Infinity 2',
              },
            ],
          },
        ],
      },
    ],
  },
];

const columns: Record<string, any> = {
  name: {
    field: 'name',
    header: 'Name',
    defaultWidth: 500,
    renderValue: ({ value, rowInfo }: { value: any; rowInfo: any }) => {
      return h(
        'div',
        { style: { color: 'red', display: 'inline-block' } },
        `${rowInfo.id} - ${value}`,
      );
    },
    renderTreeIcon: true,
    renderSelectionCheckBox: true,
  },
};

const defaultTreeSelection: TreeSelectionValue = {
  defaultSelection: false,
  selectedPaths: [['3']],
  deselectedPaths: [['3', '31', '311', '3110']],
};

const dataSourceApi = ref<DataSourceApi<FileSystemNode> | null>(null);

const onReady = (api: DataSourceApi<FileSystemNode>) => {
  dataSourceApi.value = api;
};

const treeSelectionState = ref<TreeSelectionValue>(defaultTreeSelection);

(globalThis as any).treeSelectionState = treeSelectionState.value;

const onTreeSelectionChange = (
  _e: any,
  { treeSelectionState: selState }: { treeSelectionState: any },
) => {
  const newSelection: TreeSelectionValue = {
    defaultSelection: false,
    selectedPaths: selState.getSelectedLeafNodePaths(),
  };
  treeSelectionState.value = newSelection;
  (globalThis as any).treeSelectionState = newSelection;
};

const selectAll = () => {
  dataSourceApi.value!.treeApi.selectAll();
};

const deselectAll = () => {
  dataSourceApi.value!.treeApi.deselectAll();
};

const dataSource = () => {
  return Promise.resolve(nodes);
};

const domProps = { style: { height: '100%' } };
</script>

<template>
  <TreeDataSource
    :onReady="onReady"
    nodesKey="children"
    primaryKey="id"
    :data="dataSource"
    :treeSelection="treeSelectionState"
    selectionMode="multi-row"
    :onTreeSelectionChange="onTreeSelectionChange"
  >
    <div
      :style="{
        color: 'var(--infinite-cell-color)',
        padding: '10px',
        display: 'flex',
        gap: '10px',
      }"
    >
      <button @click="selectAll">Select all</button>
      <button @click="deselectAll">Deselect all</button>
    </div>

    <TreeGrid :columns="columns" :domProps="domProps" />
  </TreeDataSource>
</template>

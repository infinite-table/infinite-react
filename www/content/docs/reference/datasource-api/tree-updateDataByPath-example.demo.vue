<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-vue';
import type {
  DataSourceApi,
  InfiniteTableColumn,
} from '@infinite-table/infinite-vue';

type FileSystemNode = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  extension?: string;
  mimeType?: string;
  sizeInKB: number;
  children?: FileSystemNode[];
};

const columns: Record<string, InfiniteTableColumn<FileSystemNode>> = {
  name: { field: 'name', header: 'Name', renderTreeIcon: true },
  type: { field: 'type', header: 'Type' },
  extension: { field: 'extension', header: 'Extension' },
  mimeType: { field: 'mimeType', header: 'Mime Type' },
  size: { field: 'sizeInKB', type: 'number', header: 'Size (KB)' },
};

const dataSourceApi = shallowRef<DataSourceApi<FileSystemNode> | null>(null);
const activeIndex = ref(0);

const setDataSourceApi = (api: DataSourceApi<FileSystemNode>) => {
  dataSourceApi.value = api;
};

const setActiveIndex = (index: number) => {
  activeIndex.value = index;
};

const getActiveTreeNode = () => {
  const rowInfo = dataSourceApi.value?.getRowInfoByIndex(activeIndex.value);
  if (!rowInfo || !rowInfo.isTreeNode) {
    return null;
  }
  return rowInfo;
};

const updateCurrentNode = () => {
  const rowInfo = getActiveTreeNode();
  if (!rowInfo) {
    return;
  }
  const randomSize = Math.floor(Math.random() * 10000) + 1;

  dataSourceApi.value!.updateDataByNodePath(
    { sizeInKB: randomSize, name: getRandomFileName() },
    rowInfo.nodePath,
  );
};

const removeChildren = () => {
  const rowInfo = getActiveTreeNode();
  if (!rowInfo) {
    return;
  }
  dataSourceApi.value!.updateDataByNodePath(
    {
      children: undefined,
    },
    rowInfo.nodePath,
  );
};

const addChildren = () => {
  const rowInfo = getActiveTreeNode();
  if (!rowInfo) {
    return;
  }
  const count = Math.floor(Math.random() * 5) + 1;
  const generated: FileSystemNode[] = Array.from({ length: count }, () => ({
    id: `generated-${times++}`,
    name: getRandomFileName(),
    sizeInKB: Math.floor(Math.random() * 10000) + 1,
    type: 'file',
  }));
  dataSourceApi.value!.updateDataByNodePath(
    {
      children: [...(rowInfo.data.children || []), ...generated],
    },
    rowInfo.nodePath,
  );
};

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
            {
              id: '100',
              name: 'Report.docx',
              sizeInKB: 210,
              type: 'file',
              extension: 'docx',
              mimeType: 'application/msword',
            },
            {
              id: '101',
              name: 'Vacation.docx',
              sizeInKB: 120,
              type: 'file',
              extension: 'docx',
              mimeType: 'application/msword',
            },
            {
              id: '102',
              name: 'CV.pdf',
              sizeInKB: 108,
              type: 'file',
              extension: 'pdf',
              mimeType: 'application/pdf',
            },
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
        {
          id: '20',
          name: 'unknown.txt',
          sizeInKB: 100,
          type: 'file',
        },
      ],
    },
    {
      id: '3',
      name: 'Media',
      sizeInKB: 1000,
      type: 'folder',
      children: [
        {
          id: '30',
          name: 'Music - empty',
          sizeInKB: 0,
          type: 'folder',
          children: [],
        },
        {
          id: '31',
          name: 'Videos',
          sizeInKB: 5400,
          type: 'folder',
          children: [
            {
              id: '310',
              name: 'Vacation.mp4',
              sizeInKB: 108,
              type: 'file',
              extension: 'mp4',
              mimeType: 'video/mp4',
            },
          ],
        },
      ],
    },
  ];
  return Promise.resolve(nodes);
};

let times = 0;
const getRandomFileName = () => {
  const names = [
    'Report',
    'Vacation',
    'CV',
    'Unknown',
    'Sales.jpg',
    'Finances.xls',
    'Presentation.ppt',
    'Budget.xlsx',
    'Notes.txt',
    'Resume.docx',
    'Agenda.docx',
    'Summary.docx',
    'Proposal.docx',
    'Report.docx',
    'Invoice.pdf',
    'Memo.docx',
    'Letter.docx',
    'Plan.docx',
    'Guide.docx',
  ];
  const name = names[Math.floor(Math.random() * names.length)];
  const [namePart, extension] = name.split('.');
  times++;
  return `${namePart}${times}${extension ? `.${extension}` : ''}`;
};
</script>

<template>
  <div :style="{ color: 'var(--infinite-cell-color)', padding: '10px' }">
    <div>Use the buttons below to update the current active node.</div>
    <div :style="{ display: 'flex', gap: '10px', padding: '10px' }">
      <button @click="updateCurrentNode">Update current node</button>
      <button @click="removeChildren">Remove children</button>
      <button @click="addChildren">Add children</button>
    </div>
  </div>
  <TreeDataSource
    nodesKey="children"
    primaryKey="id"
    :data="dataSource"
    :onReady="setDataSourceApi"
  >
    <TreeGrid
      :columns="columns"
      :activeRowIndex="activeIndex"
      :onActiveRowIndexChange="setActiveIndex"
    />
  </TreeDataSource>
</template>

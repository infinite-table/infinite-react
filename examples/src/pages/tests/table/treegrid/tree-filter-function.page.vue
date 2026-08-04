<script setup lang="ts">
import { computed, ref } from 'vue';

import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-vue';

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
      { name: 'timetable.xls', type: 'file', sizeKB: 10, id: '2' },
      {
        name: 'resume.ppt',
        type: 'file',
        sizeKB: 100,
        id: '3',
      },
      {
        type: 'folder',
        name: 'pictures',
        id: '4',
        children: [
          {
            name: 'beach.jpg',
            type: 'file',
            sizeKB: 2024,
            id: '5',
          },
          {
            name: 'mountain.jpg',
            type: 'file',
            sizeKB: 302,
            id: '6',
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
  {
    type: 'folder',
    name: 'Downloads',
    id: '8',
    collapsed: true,
    children: [
      {
        name: 'resume.doc',
        type: 'file',
        sizeKB: 5034,
        id: '9',
      },
      {
        name: 'resume.pdf',
        type: 'file',
        sizeKB: 1000,
        id: '10',
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

const filter = ref('');

const filterFunction = computed(() => {
  const currentFilter = filter.value;

  const nodeMatches = ({ data }: { data: FileSystemNode }) => {
    return !currentFilter
      ? data
      : data.name.toLowerCase().includes(currentFilter.toLowerCase());
  };

  return ({
    data,
    filterTreeNode,
  }: {
    data: FileSystemNode;
    filterTreeNode: (data: FileSystemNode) => FileSystemNode | boolean;
  }) => {
    if (!Array.isArray(data.children)) {
      return nodeMatches({ data });
    }

    return filterTreeNode(data);
  };
});

const onInput = (e: Event) => {
  filter.value = (e.target as HTMLInputElement).value;
};

const defaultTreeExpandState = {
  defaultExpanded: true as const,
  collapsedPaths: [],
};

const editable = () => true;

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
  <input
    type="text"
    name="filter"
    class="border border-black p-2 m-1"
    placeholder="Type to filter"
    :value="filter"
    @input="onInput"
  />
  <TreeDataSource
    :data="nodes"
    primaryKey="id"
    selectionMode="multi-row"
    :treeFilterFunction="filterFunction"
    :defaultTreeExpandState="defaultTreeExpandState"
  >
    <TreeGrid
      :wrapRowsHorizontally="true"
      :editable="editable"
      :domProps="domProps"
      :columns="columns"
    />
  </TreeDataSource>
</template>

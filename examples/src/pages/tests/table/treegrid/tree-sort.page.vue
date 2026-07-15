<script setup lang="ts">
import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-vue';

type FileSystemNode = {
  name: string;
  children?: FileSystemNode[] | null;
  size: number;
  id: number;
  collapsed?: boolean;
};

const nodes: FileSystemNode[] = [
  {
    id: 1,
    size: 130,
    name: 'Documents',
    children: [
      {
        id: 2,
        size: 110,
        name: 'Work',
      },
      {
        id: 3,
        size: 20,
        name: 'Vacation',
      },
    ],
  },
  {
    id: 4,
    size: 100,
    name: 'Downloads',
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
  size: { field: 'size', type: 'number' },
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
    <TreeDataSource
      :data="nodes"
      primaryKey="id"
      nodesKey="children"
      selectionMode="multi-row"
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

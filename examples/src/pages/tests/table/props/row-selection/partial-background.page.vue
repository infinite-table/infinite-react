<script setup lang="ts">
import { ref } from 'vue';

import {
  DataSource,
  InfiniteTable,
  TreeDataSource,
  TreeGrid,
} from '@infinite-table/infinite-vue';

import { data, height80vhDomProps, type Developer } from './common';

const columns: Record<string, any> = {
  checkbox: { renderSelectionCheckBox: true, defaultWidth: 70 },
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
};

// JavaScript rows (ids 1 and 2, both in "frontend") are filtered out.
// Visible: frontend / Bill (3), backend / Mark (4), Matthew (5).
const filterFunction = ({ data }: { data: Developer }) =>
  data.preferredLanguage !== 'JavaScript';

type TreeNode = {
  id: string;
  name: string;
  children?: TreeNode[];
};

const treeNodes: TreeNode[] = [
  {
    id: 'docs',
    name: 'docs',
    children: [
      { id: 'a', name: 'a' },
      { id: 'b', name: 'b' },
    ],
  },
  {
    id: 'solo',
    name: 'solo',
    children: [{ id: 'z', name: 'z' }],
  },
];

const treeColumns: Record<string, any> = {
  name: {
    field: 'name',
    renderTreeIcon: true,
    renderSelectionCheckBox: true,
  },
};

const groupBy = [{ field: 'stack' as const }];

const defaultTreeExpandState = {
  defaultExpanded: true as const,
  collapsedPaths: [],
};
const defaultTreeSelection = {
  defaultSelection: false as const,
  selectedPaths: [],
};

const kind = ref<'group' | 'tree'>('group');
(globalThis as any).setKind = (value: 'group' | 'tree') => {
  kind.value = value;
};
</script>

<template>
  <TreeDataSource
    v-if="kind === 'tree'"
    primaryKey="id"
    nodesKey="children"
    :data="treeNodes"
    selectionMode="multi-row"
    :defaultTreeExpandState="defaultTreeExpandState"
    :defaultTreeSelection="defaultTreeSelection"
  >
    <TreeGrid
      :domProps="height80vhDomProps"
      :columns="treeColumns"
      :columnDefaultWidth="220"
    />
  </TreeDataSource>
  <DataSource
    v-else
    primaryKey="id"
    :data="data"
    selectionMode="multi-row"
    multiRowSelectionTarget="all"
    :groupBy="groupBy"
    :filterFunction="filterFunction"
  >
    <InfiniteTable :domProps="height80vhDomProps" :columns="columns" />
  </DataSource>
</template>

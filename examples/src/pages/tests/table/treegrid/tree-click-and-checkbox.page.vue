<script setup lang="ts">
import { computed, ref } from 'vue';
import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-vue';

type FileSystemNode = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileSystemNode[];
};

const file = (id: string): FileSystemNode => ({ id, name: id, type: 'file' });
const folder = (id: string, children: FileSystemNode[]): FileSystemNode => ({
  id,
  name: id,
  type: 'folder',
  children,
});

// displayed, with pics collapsed:
// docs (a, b), pics (x, y), music (s1, s2, sub (t1))
const nodes: FileSystemNode[] = [
  folder('docs', [file('a'), file('b')]),
  folder('pics', [file('x'), file('y')]),
  folder('music', [file('s1'), file('s2'), folder('sub', [file('t1')])]),
];

const domProps = { style: { height: '80vh' } };

const defaultTreeExpandState = {
  defaultExpanded: true,
  collapsedPaths: [['pics']],
};

const multiRowSelection = { defaultSelection: false, selectedPaths: [] };

const singleRow = ref(false);
const checkbox = ref(false);
const selectWith = ref<'click' | 'checkbox'>('checkbox');
const selectedIds = ref<string[]>([]);

const columns = computed(() => ({
  name: {
    field: 'name',
    renderTreeIcon: true,
    renderSelectionCheckBox: checkbox.value,
  },
  type: { field: 'type' },
}));

const setMode = (single: boolean) => {
  singleRow.value = single;
  selectedIds.value = [];
};

const onTreeSelectionChange = (value: any, params: any) => {
  if (params.selectionMode === 'single-row') {
    selectedIds.value = value == null ? [] : [value];
    return;
  }
  selectedIds.value = params.treeSelectionState
    .getSelectedLeafNodePaths()
    .map((path: string[]) => path[path.length - 1])
    .sort();
};

const config = computed(() =>
  JSON.stringify({
    singleRow: singleRow.value,
    checkbox: checkbox.value,
    selectWith: selectWith.value,
  }),
);
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 4px">
    <button data-name="single-row" @click="setMode(true)">single-row</button>
    <button data-name="multi-row" @click="setMode(false)">multi-row</button>
    <button data-name="checkbox-on" @click="checkbox = true">checkbox-on</button>
    <button data-name="checkbox-off" @click="checkbox = false">
      checkbox-off
    </button>
    <button data-name="select-with-click" @click="selectWith = 'click'">
      select-with-click
    </button>
    <button data-name="select-with-checkbox" @click="selectWith = 'checkbox'">
      select-with-checkbox
    </button>
  </div>
  <pre data-name="selection-config">{{ config }}</pre>
  <pre data-name="selected-ids">{{ JSON.stringify(selectedIds) }}</pre>
  <TreeDataSource
    :key="singleRow ? 'single-row' : 'multi-row'"
    :data="nodes"
    primaryKey="id"
    nodesKey="children"
    :defaultTreeExpandState="defaultTreeExpandState"
    :selectionMode="singleRow ? 'single-row' : 'multi-row'"
    :defaultTreeSelection="singleRow ? null : multiRowSelection"
    :onTreeSelectionChange="onTreeSelectionChange"
  >
    <TreeGrid
      :domProps="domProps"
      :columns="columns"
      :multiRowSelectionWith="selectWith"
      :columnDefaultWidth="200"
    />
  </TreeDataSource>
</template>

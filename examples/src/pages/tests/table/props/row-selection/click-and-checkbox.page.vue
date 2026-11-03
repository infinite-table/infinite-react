<script setup lang="ts">
import { computed, ref } from 'vue';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  name: string;
  language: string;
  level: string;
};

// grouped by language, the rows are:
// TypeScript (1, 2, 3), Go (4, 5), Rust (6, 7, 8)
// and grouped by language and level:
// TypeScript (junior: 1, senior: 2, 3), Go (junior: 4, senior: 5),
// Rust (junior: 6, 7, senior: 8)
const data: Developer[] = [
  { id: 1, name: 'TS 1', language: 'TypeScript', level: 'junior' },
  { id: 2, name: 'TS 2', language: 'TypeScript', level: 'senior' },
  { id: 3, name: 'TS 3', language: 'TypeScript', level: 'senior' },
  { id: 4, name: 'Go 1', language: 'Go', level: 'junior' },
  { id: 5, name: 'Go 2', language: 'Go', level: 'senior' },
  { id: 6, name: 'Rust 1', language: 'Rust', level: 'junior' },
  { id: 7, name: 'Rust 2', language: 'Rust', level: 'junior' },
  { id: 8, name: 'Rust 3', language: 'Rust', level: 'senior' },
];

const domProps = { style: { height: '80vh' } };
const groupBy = [{ field: 'language' }];
const nestedGroupBy = [{ field: 'language' }, { field: 'level' }];
const noGroupBy: any[] = [];

const grouped = ref<false | 'language' | 'nested'>(false);
const checkboxColumn = ref(false);
const groupColumnCheckbox = ref(false);
const selectWith = ref<'click' | 'checkbox'>('checkbox');
const rowSelection = ref<any>({ selectedRows: [], defaultSelection: false });
const selectedIds = ref<any[]>([]);

let api: any = null;

const columns = computed(() => {
  const columns: Record<string, any> = {};
  if (checkboxColumn.value) {
    columns.selection = {
      renderValue: () => null,
      renderSelectionCheckBox: true,
      defaultWidth: 60,
    };
  }
  columns.name = { field: 'name' };
  columns.language = { field: 'language' };
  return columns;
});

const groupColumn = computed(() => ({
  renderSelectionCheckBox: groupColumnCheckbox.value,
}));

const onReady = (param: any) => {
  api = param.api;
  (globalThis as any).INFINITE_GRID_API = api;
};

const onRowSelectionChange = (sel: any) => {
  rowSelection.value = sel;
  selectedIds.value = api
    ? api.rowSelectionApi
        .getSelectedPrimaryKeys(sel)
        .slice()
        .sort((a: number, b: number) => a - b)
    : [];
};

const clearSelection = () => {
  rowSelection.value = { selectedRows: [], defaultSelection: false };
  selectedIds.value = [];
};

const config = computed(() =>
  JSON.stringify({
    grouped: grouped.value,
    checkboxColumn: checkboxColumn.value,
    groupColumnCheckbox: groupColumnCheckbox.value,
    selectWith: selectWith.value,
  }),
);
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 4px">
    <button data-name="group" @click="grouped = 'language'">group</button>
    <button data-name="group-nested" @click="grouped = 'nested'">
      group-nested
    </button>
    <button data-name="ungroup" @click="grouped = false">ungroup</button>
    <button data-name="checkbox-column-on" @click="checkboxColumn = true">
      checkbox-column-on
    </button>
    <button data-name="checkbox-column-off" @click="checkboxColumn = false">
      checkbox-column-off
    </button>
    <button
      data-name="group-column-checkbox-on"
      @click="groupColumnCheckbox = true"
    >
      group-column-checkbox-on
    </button>
    <button
      data-name="group-column-checkbox-off"
      @click="groupColumnCheckbox = false"
    >
      group-column-checkbox-off
    </button>
    <button data-name="select-with-click" @click="selectWith = 'click'">
      select-with-click
    </button>
    <button data-name="select-with-checkbox" @click="selectWith = 'checkbox'">
      select-with-checkbox
    </button>
    <button data-name="collapse-go" @click="api?.collapseGroupRow(['Go'])">
      collapse-go
    </button>
    <button
      data-name="collapse-ts-senior"
      @click="api?.collapseGroupRow(['TypeScript', 'senior'])"
    >
      collapse-ts-senior
    </button>
    <button data-name="clear-selection" @click="clearSelection">
      clear-selection
    </button>
  </div>
  <pre data-name="selection-config">{{ config }}</pre>
  <pre data-name="selected-ids">{{ JSON.stringify(selectedIds) }}</pre>
  <DataSource
    primaryKey="id"
    :data="data"
    :groupBy="
      grouped === 'nested' ? nestedGroupBy : grouped ? groupBy : noGroupBy
    "
    selectionMode="multi-row"
    :rowSelection="rowSelection"
    :onRowSelectionChange="onRowSelectionChange"
  >
    <InfiniteTable
      :domProps="domProps"
      :columns="columns"
      :groupColumn="groupColumn"
      groupRenderStrategy="single-column"
      :multiRowSelectionWith="selectWith"
      :onReady="onReady"
      :columnDefaultWidth="200"
    />
  </DataSource>
</template>

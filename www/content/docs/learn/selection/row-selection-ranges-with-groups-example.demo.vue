<script setup lang="ts">
import { ref, shallowRef } from 'vue';

import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
} from '@infinite-table/infinite-vue';
import type {
  InfiniteTableApi,
  InfiniteTablePropMultiRowSelectionWith,
  InfiniteTablePropColumns,
  DataSourcePropGroupBy,
  DataSourcePropRowSelection_MultiRow,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  name: string;
  language: string;
};

const data: Developer[] = [
  { id: 1, name: 'TS 1', language: 'TypeScript' },
  { id: 2, name: 'TS 2', language: 'TypeScript' },
  { id: 3, name: 'TS 3', language: 'TypeScript' },
  { id: 4, name: 'Go 1', language: 'Go' },
  { id: 5, name: 'Go 2', language: 'Go' },
  { id: 6, name: 'Rust 1', language: 'Rust' },
  { id: 7, name: 'Rust 2', language: 'Rust' },
  { id: 8, name: 'Rust 3', language: 'Rust' },
];

const columns: InfiniteTablePropColumns<Developer> = {
  name: { field: 'name' },
  language: { field: 'language' },
};

const groupBy: DataSourcePropGroupBy<Developer> = [{ field: 'language' }];

// the Go group starts collapsed
const defaultGroupRowsState = new GroupRowsState({
  expandedRows: true,
  collapsedRows: [['Go']],
});

const selectWith = ref<InfiniteTablePropMultiRowSelectionWith>('click');
const api = shallowRef<InfiniteTableApi<Developer> | null>(null);
const selected = ref<string[]>([]);

const onRowSelectionChange = (
  rowSelection: DataSourcePropRowSelection_MultiRow,
) => {
  const ids = api.value?.rowSelectionApi.getSelectedPrimaryKeys(rowSelection);
  selected.value = data.filter((d) => ids?.includes(d.id)).map((d) => d.name);
};

const onReady = ({ api: tableApi }: { api: InfiniteTableApi<Developer> }) => {
  api.value = tableApi;
};
</script>

<template>
  <div
    :style="{
      color: 'var(--infinite-cell-color)',
      padding: '10px',
      display: 'flex',
      gap: '20px',
      alignItems: 'center',
    }"
  >
    <label>
      multiRowSelectionWith:
      <select v-model="selectWith">
        <option value="click">click</option>
        <option value="checkbox">checkbox</option>
      </select>
    </label>
    <span>Selected: {{ selected.join(', ') || 'none' }}</span>
  </div>
  <DataSource
    :data="data"
    primaryKey="id"
    selectionMode="multi-row"
    :groupBy="groupBy"
    :defaultGroupRowsState="defaultGroupRowsState"
    :onRowSelectionChange="onRowSelectionChange"
  >
    <InfiniteTable
      :columns="columns"
      :columnDefaultWidth="150"
      groupRenderStrategy="single-column"
      :multiRowSelectionWith="selectWith"
      :onReady="onReady"
    />
  </DataSource>
</template>

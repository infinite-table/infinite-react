<script setup lang="ts">
import { ref, shallowRef } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import type {
  InfiniteTableApi,
  DataSourcePropMultiRowSelectionTarget,
  InfiniteTablePropColumns,
  DataSourcePropGroupBy,
  DataSourcePropRowSelection_MultiRow,
} from '@infinite-table/infinite-vue';

const columns: InfiniteTablePropColumns<Developer> = {
  checkbox: {
    renderSelectionCheckBox: true,
    defaultWidth: 70,
  },
  id: { field: 'id', defaultWidth: 80 },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
};

const groupBy: DataSourcePropGroupBy<Developer> = [{ field: 'stack' }];

const filterFunction = ({ data }: { data: Developer }) =>
  data.preferredLanguage === 'TypeScript';

const target = ref<DataSourcePropMultiRowSelectionTarget>('visible');
const filtered = ref(true);
const api = shallowRef<InfiniteTableApi<Developer> | null>(null);
const selectedCount = ref(0);

const onRowSelectionChange = (
  rowSelection: DataSourcePropRowSelection_MultiRow,
) => {
  selectedCount.value =
    api.value?.rowSelectionApi.getSelectedPrimaryKeys(rowSelection).length ?? 0;
};

const onReady = ({ api: tableApi }: { api: InfiniteTableApi<Developer> }) => {
  api.value = tableApi;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
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
      multiRowSelectionTarget:
      <select v-model="target">
        <option value="all">all</option>
        <option value="visible">visible</option>
      </select>
    </label>
    <label>
      <input type="checkbox" v-model="filtered" />
      Only show TypeScript developers
    </label>
    <button @click="api?.rowSelectionApi.selectAll()">Select all</button>
    <span>Selected rows (including filtered out): {{ selectedCount }}</span>
  </div>
  <DataSource
    :data="dataSource"
    primaryKey="id"
    selectionMode="multi-row"
    :multiRowSelectionTarget="target"
    :groupBy="groupBy"
    :filterFunction="filtered ? filterFunction : undefined"
    :onRowSelectionChange="onRowSelectionChange"
  >
    <InfiniteTable
      :columns="columns"
      :columnDefaultWidth="150"
      :onReady="onReady"
    />
  </DataSource>
</template>

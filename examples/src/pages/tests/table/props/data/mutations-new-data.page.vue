<script setup lang="ts">
import { ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import type { DataSourceApi } from '@infinite-table/infinite-vue';

import {
  type Developer as BaseDeveloper,
  developersData5,
  mark as baseMark,
  height100DomProps,
} from './common';

type Developer = BaseDeveloper & { count?: number };

let c = 0;
function count() {
  return c;
}
const getData: () => Developer[] = () =>
  developersData5.map((row) => ({ ...row, count: count() }));

const columns: Record<string, any> = {
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
  },
  age: {
    field: 'age',
    type: 'number',
    defaultEditable: true,
    getValueToPersist: ({ value }: { value: any }) => {
      return !isNaN(Number(value)) ? Number(value) : value;
    },
  },

  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
  count: { field: 'count', minWidth: 150 },
};

const mark: Developer = { ...baseMark, count: count() };

const beforeMark: Developer = {
  id: 7,
  firstName: 'Before Mark',
  lastName: 'Before',
  age: 39,
  canDesign: 'no',
  currency: 'USD',
  preferredLanguage: 'Go',
  stack: 'frontend',
  count: count(),
};

(globalThis as any).mutations = undefined;
(globalThis as any).onDataMutationsCalls = 0;

const data = ref<Developer[]>(getData());

let dataSourceApi: DataSourceApi<Developer> | null = null;

const onReady = (api: DataSourceApi<Developer>) => {
  dataSourceApi = api;
};

const onAddClick = () => {
  dataSourceApi!.addData(mark);
  dataSourceApi!.insertData(beforeMark, {
    position: 'before',
    primaryKey: 6,
  });
};

const onUpdateClick = () => {
  dataSourceApi!.updateData({
    id: 2,
    age: 100,
  });
};

const onRefreshClick = () => {
  c++;
  data.value = getData();
};

const onDataMutations = ({ mutations }: { mutations: any }) => {
  (globalThis as any).mutations = mutations;
  (globalThis as any).onDataMutationsCalls++;
};

const columnSizing = {
  id: {
    width: 500,
  },
};

</script>

<template>
  <button @click="onAddClick">Add 2 items</button>

  <button @click="onUpdateClick">Update id=2 to age=100</button>
  <button @click="onRefreshClick">Refresh data</button>

  <DataSource
    :data="data"
    primaryKey="id"
    :onReady="onReady"
    :onDataMutations="onDataMutations"
  >
    <InfiniteTable
      :domProps="height100DomProps"
      :columnSizing="columnSizing"
      :columnDefaultWidth="100"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>

<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import type { DataSourceApi } from '@infinite-table/infinite-vue';

import {
  type Developer,
  developersData5 as data,
  mark,
  height100DomProps,
} from './common';

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
};

const beforeMark: Developer = {
  id: 7,
  firstName: 'Before Mark',
  lastName: 'Before',
  age: 39,
  canDesign: 'no',
  currency: 'USD',
  preferredLanguage: 'Go',
  stack: 'frontend',
};

(globalThis as any).mutations = undefined;

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

const onClearClick = () => {
  dataSourceApi!.clearAllData();
};

const onDataMutations = ({ mutations }: { mutations: any }) => {
  console.log(mutations);
  (globalThis as any).mutations = mutations;
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

  <button @click="onClearClick">Clear all data</button>

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

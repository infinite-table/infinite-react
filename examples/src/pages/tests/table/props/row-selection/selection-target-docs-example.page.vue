<script setup lang="ts">
import { ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import type { DataSourcePropMultiRowSelectionTarget } from '@infinite-table/infinite-vue';

import { data, height80vhDomProps, type Developer } from './common';

const columns: Record<string, any> = {
  checkbox: { renderSelectionCheckBox: true, defaultWidth: 80 },
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
};

const groupBy = [{ field: 'stack' as const }];

const filterFunction = ({ data }: { data: Developer }) =>
  data.preferredLanguage === 'TypeScript';

const dataSource = () =>
  new Promise<Developer[]>((resolve) => setTimeout(() => resolve(data), 20));

const target = ref<DataSourcePropMultiRowSelectionTarget>('visible');
const filtered = ref(true);

const toolbarStyle = {
  padding: '10px',
  display: 'flex',
  gap: '20px',
  color: 'tomato',
};
</script>

<template>
  <div :style="toolbarStyle">
    <label>
      multiRowSelectionTarget:
      <select data-name="target" v-model="target">
        <option value="all">all</option>
        <option value="visible">visible</option>
      </select>
    </label>
    <label>
      <input data-name="only-typescript" type="checkbox" v-model="filtered" />
      Only show TypeScript developers
    </label>
  </div>
  <DataSource
    :data="dataSource"
    primaryKey="id"
    selectionMode="multi-row"
    :multiRowSelectionTarget="target"
    :groupBy="groupBy"
    :filterFunction="filtered ? filterFunction : undefined"
  >
    <InfiniteTable :domProps="height80vhDomProps" :columns="columns" />
  </DataSource>
</template>

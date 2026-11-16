<script setup lang="ts">
import { ref } from 'vue';
import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
} from '@infinite-table/infinite-vue';

import { columns } from './columns.vue';

type Density = 'compact' | 'comfortable' | 'spacious';

const groupRowsState = new GroupRowsState({
  expandedRows: true,
  collapsedRows: [],
});

const density = ref<Density>('compact');

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees100').then((r) =>
    r.json(),
  );
};
</script>

<template>
  <div
    :class="`infinite-density--${density}`"
    :style="{
      display: 'flex',
      flexFlow: 'column',
      flex: 1,
      color: 'var(--infinite-cell-color)',
      background: 'var(--infinite-background)',
    }"
  >
    <div
      :style="{
        display: 'flex',
        flexFlow: 'row',
        alignItems: 'center',
        gap: '10px',
        padding: '10px',
      }"
    >
      Density
      <select title="Select density" v-model="density">
        <option value="compact">compact</option>
        <option value="comfortable">comfortable</option>
        <option value="spacious">spacious</option>
      </select>
    </div>
    <DataSource
      :data="dataSource"
      primaryKey="id"
      :groupBy="[{ field: 'department' }]"
      :defaultGroupRowsState="groupRowsState"
    >
      <!-- no rowHeight specified, so the density drives it -->
      <InfiniteTable debugId="density-example" :columns="columns" />
    </DataSource>
  </div>
</template>

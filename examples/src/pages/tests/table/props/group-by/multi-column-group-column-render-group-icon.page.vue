<script setup lang="ts">
import { h } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import type {
  DataSourceGroupBy,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  country: string;
  language: string;
};

const data: Developer[] = [
  { id: 1, firstName: 'Ana', country: 'Australia', language: 'Go' },
  { id: 2, firstName: 'John', country: 'Australia', language: 'Java' },
  { id: 3, firstName: 'Emma', country: 'Brazil', language: 'Go' },
];

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: { field: 'firstName' },
};

const groupBy: DataSourceGroupBy<Developer>[] = [
  { field: 'country' },
  { field: 'language' },
];

// wraps the default icon, so the test can tell where it is called
const groupColumn = () => ({
  renderGroupIcon: ({ renderBag }: any) =>
    h('span', { 'data-name': 'custom-group-icon' }, [renderBag.groupIcon]),
});

const domProps = {
  style: { height: '80vh' },
};
</script>

<template>
  <DataSource primaryKey="id" :data="data" :groupBy="groupBy">
    <InfiniteTable
      :domProps="domProps"
      :columns="columns"
      groupRenderStrategy="multi-column"
      :groupColumn="groupColumn"
    />
  </DataSource>
</template>

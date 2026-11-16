<script setup lang="ts">
import { ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import type {
  DataSourceData,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-vue';

import sinon from 'sinon';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  lastName: { field: 'lastName' },
  country: { field: 'country' },
};

const renderCount = ref(0);

// called from the template, so every render of the page passes
// a new object, with the same content
const getFilterTypes = (): any => ({
  custom: {
    label: 'Custom',
    emptyValues: [''],
    defaultOperator: 'eq',
    operators: [{ name: 'eq', fn: () => true }],
  },
});

const dataSource: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers100-sql`).then(
    (r) => r.json(),
  );
};

const spiedDataSource = sinon.spy(dataSource);

(globalThis as any).dataSource = spiedDataSource;

const domProps = {
  style: {
    height: '80vh',
  },
};
</script>

<template>
  <button @click="renderCount = renderCount + 1">
    Rerender ({{ renderCount }})
  </button>
  <DataSource
    :data="spiedDataSource"
    primaryKey="id"
    :filterTypes="getFilterTypes()"
  >
    <InfiniteTable :columns="columns" :domProps="domProps" />
  </DataSource>
</template>

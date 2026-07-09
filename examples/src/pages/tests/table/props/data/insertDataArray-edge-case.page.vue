<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import type { DataSourceApi } from '@infinite-table/infinite-vue';

type Developer = {
  id: number;

  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  age: number;
};

const data: Developer[] = [];

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
  },

  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
};

(globalThis as any).mutations = undefined;

let dataSourceApi: DataSourceApi<Developer> | null = null;

const onReady = (api: DataSourceApi<Developer>) => {
  dataSourceApi = api;
};

const onInsertClick = () => {
  dataSourceApi!
    .insertDataArray(
      [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Bob',
          age: 20,
          canDesign: 'yes',
          currency: 'USD',
          preferredLanguage: 'JavaScript',
          stack: 'frontend',
        },
        {
          id: 2,
          firstName: 'Hapson',
          lastName: 'Twain',
          age: 31,
          canDesign: 'yes',
          currency: 'CAD',
          preferredLanguage: 'Rust',
          stack: 'backend',
        },
      ],
      {
        position: 'end',
      },
    )
    .then(() => {
      console.log(dataSourceApi?.getRowInfoArray());
    });
};

const domProps = {
  style: {
    height: '100%',
  },
};
</script>

<template>
  <button @click="onInsertClick">Insert item</button>

  <DataSource :data="data" primaryKey="id" :onReady="onReady">
    <InfiniteTable
      :domProps="domProps"
      :columnDefaultWidth="100"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>

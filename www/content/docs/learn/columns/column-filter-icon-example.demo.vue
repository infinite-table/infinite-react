<script setup lang="ts">
import { h } from 'vue';
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import type {
  DataSourceData,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  salary: number;
};

const data: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql?`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    type: 'number',
    defaultWidth: 100,
  },
  salary: {
    field: 'salary',
    type: 'number',
    header: ({ filtered }) => {
      return filtered ? h('b', 'Salary') : 'Salary';
    },

    renderFilterIcon: () => {
      return null;
    },
  },

  firstName: {
    field: 'firstName',
    renderFilterIcon: ({ filtered }) => {
      return filtered ? '🔥' : '';
    },
  },
  stack: { field: 'stack' },
  currency: { field: 'currency' },
};

const domProps = {
  style: {
    height: '100%',
  },
};
</script>

<template>
  <DataSource
    :data="data"
    primaryKey="id"
    :defaultFilterValue="[]"
    :filterDelay="0"
  >
    <InfiniteTable
      debugId="column-filter-icon-example"
      :domProps="domProps"
      :columnDefaultWidth="150"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>

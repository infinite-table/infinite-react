<script setup lang="ts">
import { h } from 'vue';
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-vue';

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    defaultWidth: 80,
    renderMenuIcon: false,
  },

  name: {
    header: 'Name', // custom column header label
    valueGetter: ({ data }) => `${data.firstName} ${data.lastName}`,

    // custom menu icon
    renderMenuIcon: () => h('div', '🌎'),
  },
  age: {
    field: 'age',
    header: 'Age',
    renderMenuIcon: ({ column }) => {
      return `🔧 ${column.id}`;
    },
  },
};

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const domProps = {
  style: {
    minHeight: '300px',
  },
};
</script>

<template>
  <DataSource primaryKey="id" :data="dataSource">
    <InfiniteTable
      debugId="column-menu-icon-example"
      :domProps="domProps"
      :columns="columns"
    />
  </DataSource>
</template>

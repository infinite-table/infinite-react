<script setup lang="ts">
import { defineComponent, h } from 'vue';
import {
  InfiniteTable,
  DataSource,
  useInfiniteHeaderCell,
} from '@infinite-table/infinite-vue';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-vue';

const NameSortIcon = defineComponent({
  setup() {
    // a ref with the same information the renderSortIcon function receives
    const headerCell = useInfiniteHeaderCell<Developer>();

    return () => {
      const { columnSortInfo } = headerCell.value;
      if (!columnSortInfo) {
        return ' 🤷‍♂️';
      }
      return columnSortInfo.dir === 1 ? '▲' : '▼';
    };
  },
});

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id', // will be used as default label in column header
    defaultWidth: 100,
  },
  name: {
    header: 'Name', // custom column header label
    valueGetter: ({ data }) => `${data.firstName} ${data.lastName}`,
    renderSortIcon: () => h(NameSortIcon),
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
      debugId="column-sort-icon-example"
      :domProps="domProps"
      :columns="columns"
    />
  </DataSource>
</template>

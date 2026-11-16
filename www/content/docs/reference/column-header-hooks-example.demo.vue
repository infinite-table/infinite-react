<script setup lang="ts">
import { defineComponent, h } from 'vue';
import {
  InfiniteTable,
  DataSource,
  useInfiniteHeaderCell,
} from '@infinite-table/infinite-vue';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const HobbyHeader = defineComponent({
  setup() {
    const headerCell = useInfiniteHeaderCell<Developer>();

    return () => {
      const { column } = headerCell.value;

      return h(
        'b',
        { style: { color: '#0000c2' } },
        `${column?.field} 🤷📸👨🏻‍🍳💃📚⛹️`,
      );
    };
  },
});

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', maxWidth: 80 },
  stack: {
    field: 'stack',
  },
  hobby: {
    field: 'hobby',
    components: {
      HeaderCell: HobbyHeader,
    },
  },
};
</script>

<template>
  <DataSource primaryKey="id" :data="dataSource">
    <InfiniteTable
      debugId="column-header-hooks-example"
      :columns="columns"
      :columnDefaultWidth="200"
    />
  </DataSource>
</template>

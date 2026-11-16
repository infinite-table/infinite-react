<script setup lang="ts">
import { defineComponent, h } from 'vue';
import {
  InfiniteTable,
  DataSource,
  useInfiniteColumnCell,
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

const CustomCell = defineComponent({
  setup() {
    // a ref with the same information the render function receives
    const cell = useInfiniteColumnCell<Developer>();

    return () => {
      const { value, data } = cell.value;

      let emoji = '🤷';
      switch (value) {
        case 'photography':
          emoji = '📸';
          break;
        case 'cooking':
          emoji = '👨🏻‍🍳';
          break;
        case 'dancing':
          emoji = '💃';
          break;
        case 'reading':
          emoji = '📚';
          break;
        case 'sports':
          emoji = '⛹️';
          break;
      }

      const label = data?.stack === 'frontend' ? '⚛️' : '';

      return h('b', `${emoji} + ${label}`);
    };
  },
});

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', maxWidth: 80 },
  firstName: { field: 'firstName' },
  hobby: {
    field: 'hobby',
    // we're not using the arg of the render function directly
    // but CustomCell uses `useInfiniteColumnCell` to retrieve it instead
    render: () => h(CustomCell),
  },
};
</script>

<template>
  <DataSource primaryKey="id" :data="dataSource">
    <InfiniteTable
      debugId="column-render-hooks-example"
      :columns="columns"
      :columnDefaultWidth="200"
    />
  </DataSource>
</template>

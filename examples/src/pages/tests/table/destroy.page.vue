<script setup lang="ts">
import { defineComponent, h, ref } from 'vue';

import {
  InfiniteTable,
  DataSource,
  useInfiniteTableContext,
} from '@infinite-table/infinite-vue';

import type {
  DataSourceData,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;

  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

let testBrain: any;
function setBrain(brain: any) {
  if (!testBrain) {
    testBrain = brain;
    brain.onDestroy(() => {
      (globalThis as any).brainDestroyed = true;
    });
  }
}

// custom cell used only to grab the brain from the table context,
// like the React page does via useInfiniteTableSelector inside render
const SalaryCell = defineComponent({
  name: 'SalaryCell',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    const tableContext = useInfiniteTableContext<Developer>();
    setBrain(tableContext.getState().brain);

    return () => h('div', attrs, slots.default?.());
  },
});

const columns: InfiniteTablePropColumns<Developer> = {
  preferredLanguage: { field: 'preferredLanguage' },
  salary: {
    field: 'salary',
    type: 'number',
    render: ({ value }) => {
      return value;
    },
    components: {
      ColumnCell: SalaryCell as any,
    },
  },
  age: { field: 'age' },
  canDesign: { field: 'canDesign' },
  country: { field: 'country' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
};

const destroyed = ref(false);

const domProps = {
  style: { height: '90vh' },
};

const dataSource: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers10-sql`).then(
    (r) => r.json(),
  );
};
</script>

<template>
  <button @click="destroyed = true">destroy</button>
  <DataSource v-if="!destroyed" primaryKey="id" :data="dataSource">
    <InfiniteTable
      :columns="columns"
      :columnDefaultWidth="220"
      :domProps="domProps"
    />
  </DataSource>
</template>

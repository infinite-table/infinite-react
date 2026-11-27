<script setup lang="ts">
import { defineComponent, h, ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  age: number;
};

const data: Developer[] = [
  { id: 1, firstName: 'John', age: 20 },
  { id: 2, firstName: 'Marry', age: 25 },
  { id: 3, firstName: 'Bill', age: 30 },
];

// whether the wrappers render their slot - set from the spec
const open = ref(true);
(globalThis as any).setWrappersOpen = (value: boolean) => {
  open.value = value;
};

// renders its default slot inside a span, when open
const Wrapper = defineComponent({
  setup(_props, { slots }) {
    return () =>
      h(
        'span',
        { 'data-name': 'wrapper' },
        open.value ? slots.default?.() : undefined,
      );
  },
});

const Badge = defineComponent({
  setup() {
    return () => h('span', { 'data-name': 'badge' }, '★');
  },
});

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: {
    field: 'firstName',
    header: () => h(Wrapper, null, () => ['First ', h('b', 'name')]),
    renderValue: ({ value }) => h(Wrapper, null, () => [value]),
  },
  age: {
    field: 'age',
    type: 'number',
    renderValue: ({ value }) =>
      h(Wrapper, null, () => [value, ' years ', h(Badge)]),
  },
};

const domProps = {
  style: {
    height: '80vh',
  },
};
</script>

<template>
  <DataSource :data="data" primaryKey="id">
    <InfiniteTable
      :columns="columns"
      :columnDefaultWidth="200"
      :domProps="domProps"
    />
  </DataSource>
</template>

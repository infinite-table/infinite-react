<script setup lang="ts">
import { defineComponent, h } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-vue';

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

const data: Developer[] = [
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
    firstName: 'Marry',
    lastName: 'Bob',
    age: 25,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 3,
    firstName: 'Bill',
    lastName: 'Bobson',
    age: 30,
    canDesign: 'no',
    currency: 'CAD',
    preferredLanguage: 'TypeScript',
    stack: 'frontend',
  },
  {
    id: 4,
    firstName: 'Mark',
    lastName: 'Twain',
    age: 31,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Rust',
    stack: 'backend',
  },
  {
    id: 5,
    firstName: 'Matthew',
    lastName: 'Hilson',
    age: 29,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Go',
    stack: 'backend',
  },
];

const HeaderCell = defineComponent({
  name: 'HeaderCell',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    return () =>
      h(
        'div',
        {
          ...attrs,
          'data-name': 'header-cell-firstName',
          style: {
            ...(attrs.style as any),
            backgroundColor: 'red',
          },
        },
        [slots.default?.(), '!'],
      );
  },
});

const ColumnCell = defineComponent({
  name: 'ColumnCell',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    return () =>
      h(
        'div',
        {
          ...attrs,
          'data-name': 'column-cell-firstName',
        },
        [slots.default?.(), '!'],
      );
  },
});

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: {
    field: 'firstName',
    components: {
      HeaderCell: HeaderCell as any,
      ColumnCell: ColumnCell as any,
    },
  },
  age: {
    field: 'age',
    type: 'number',
  },

  stack: { field: 'stack' },
  currency: { field: 'currency' },
};

const tableColumns = {
  firstName: columns.firstName,
};

const dataSource = () => {
  return Promise.resolve(data.slice(0, 1));
};

const domProps = {
  style: {
    minHeight: '500px',
  },
};
</script>

<template>
  <DataSource :data="dataSource" primaryKey="id">
    <InfiniteTable :columns="tableColumns" :domProps="domProps" />
  </DataSource>
</template>

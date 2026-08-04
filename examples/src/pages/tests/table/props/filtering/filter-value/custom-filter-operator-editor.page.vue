<script setup lang="ts">
import { defineComponent, h } from 'vue';

import {
  DataSource,
  InfiniteTable,
  useInfiniteColumnFilterEditor,
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

const data: Developer[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Bob',
    salary: 2000,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 2,
    firstName: 'Marry',
    lastName: 'Bob',
    salary: 3500,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 3,
    firstName: 'Bill',
    lastName: 'Bobson',
    salary: 3000,
    canDesign: 'no',
    currency: 'CAD',
    preferredLanguage: 'TypeScript',
    stack: 'frontend',
  },
  {
    id: 4,
    firstName: 'Mark',
    lastName: 'Twain',
    salary: 1000,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Rust',
    stack: 'backend',
  },
  {
    id: 5,
    firstName: 'Matthew',
    lastName: 'Hilson',
    salary: 12900,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Go',
    stack: 'backend',
  },
];

const columns: Record<string, any> = {
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
  },
  salary: {
    defaultFilterable: true,
    field: 'salary',
    type: 'number',
    filterType: 'salary',
  },
  stack: { field: 'stack' },
  currency: { field: 'currency', defaultFilterable: false },
};

const DefaultFilterTypeEditor = defineComponent({
  setup() {
    const editor = useInfiniteColumnFilterEditor();
    return () =>
      h(
        'div',
        { 'data-operator': 'default-filter-type-editor' },
        editor.filtered.value
          ? `Operator ${editor.operator.value?.name}`
          : 'Not applied',
      );
  },
});

const MediumFilterEditor = defineComponent({
  setup() {
    return () => h('div', { 'data-operator': 'medium' }, 'Medium');
  },
});

const HighFilterEditor = defineComponent({
  setup() {
    return () => h('div', { 'data-operator': 'high' }, 'High');
  },
});

const filterTypes = {
  salary: {
    defaultOperator: '',
    emptyValues: [] as any[],
    components: {
      FilterEditor: DefaultFilterTypeEditor,
    },
    operators: [
      {
        name: 'low',
        fn: ({ currentValue, filterValue, emptyValues }: any) => {
          if (
            emptyValues.includes(currentValue) ||
            emptyValues.includes(filterValue)
          ) {
            return true;
          }
          return currentValue <= 1000;
        },
      },
      {
        name: 'medium',
        fn: ({ currentValue }: any) => {
          return currentValue > 1000 && currentValue < 10000;
        },

        components: {
          FilterEditor: MediumFilterEditor,
        },
      },
      {
        name: 'high',
        fn: ({ currentValue }: any) => {
          return currentValue >= 10000;
        },
        components: {
          FilterEditor: HighFilterEditor,
        },
      },
    ],
  },
};

const defaultFilterValue: any[] = [];

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
    :defaultFilterValue="defaultFilterValue"
    :filterDelay="0"
    :filterTypes="filterTypes"
  >
    <InfiniteTable
      :domProps="domProps"
      :columnDefaultWidth="150"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>

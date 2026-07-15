<script setup lang="ts">
import { defineComponent, h, ref } from 'vue';

import {
  DataSource,
  InfiniteTable,
  useDataSourceContext,
} from '@infinite-table/infinite-vue';

import developers100 from '../../data/developers100';

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

const dataSource = (): Promise<Developer[]> => {
  return Promise.resolve(developers100 as Developer[]);
};

const columns: Record<string, any> = {
  preferredLanguage: { field: 'preferredLanguage' },
  country: { field: 'country' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  age: { field: 'age' },
  canDesign: { field: 'canDesign' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

const shouldReloadData = {
  filterValue: false,
};

const UnfilteredCount = defineComponent({
  setup() {
    const context = useDataSourceContext();
    return () =>
      h(
        'p',
        { style: { color: 'magenta' }, 'aria-label': 'unfiltered-count' },
        `unfiltered count: ${context?.state?.value?.unfilteredCount}`,
      );
  },
});

const filterValue = ref<any>([
  {
    field: 'preferredLanguage',

    filter: {
      type: 'string',
      operator: 'eq',
      value: 'Go',
    },
  },
]);

const setJs = () => {
  filterValue.value = [
    {
      field: 'preferredLanguage',
      filter: {
        type: 'string',
        operator: 'eq',
        value: 'JavaScript',
      },
    },
  ];
};

const setGo = () => {
  filterValue.value = [
    {
      field: 'preferredLanguage',
      filter: {
        type: 'string',
        operator: 'eq',
        value: 'Go',
      },
    },
  ];
};

const setFrontend = () => {
  filterValue.value = [
    {
      field: 'stack',
      filter: { type: 'string', operator: 'eq', value: 'frontend' },
    },
  ];
};
</script>

<template>
  <div class="flex gap-2 p-2">
    <button data-name="none" @click="filterValue = undefined">
      Clear filter
    </button>

    <button data-name="js" @click="setJs">Filter by language=JavaScript</button>
    <button data-name="go" @click="setGo">Filter by language=Go</button>

    <button @click="setFrontend">filter by stack=frontend</button>
  </div>

  <DataSource
    :data="dataSource"
    primaryKey="id"
    :shouldReloadData="shouldReloadData"
    :filterValue="filterValue"
  >
    <InfiniteTable
      :domProps="domProps"
      :columnDefaultWidth="150"
      :columns="columns"
    />
    <UnfilteredCount />
  </DataSource>
</template>

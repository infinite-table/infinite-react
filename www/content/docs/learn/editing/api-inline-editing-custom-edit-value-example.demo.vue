<script setup lang="ts">
import { ref } from 'vue';
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import type {
  InfiniteTablePropColumns,
  InfiniteTableApi,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  currency: string;
  stack: string;
  hobby: string;
  salary: string;
};
const dataSource: Developer[] = [
  {
    id: 1,
    firstName: 'John',
    currency: 'USD',
    stack: 'frontend',
    hobby: 'gaming',
    salary: 'USD 1000',
  },
  {
    id: 2,
    firstName: 'Jane',
    currency: 'EUR',
    stack: 'backend',
    hobby: 'reading',
    salary: 'EUR 2000',
  },
  {
    id: 3,
    firstName: 'Jack',
    currency: 'GBP',
    stack: 'frontend',
    hobby: 'gaming',
    salary: 'GBP 3000',
  },
  {
    id: 4,
    firstName: 'Jill',
    currency: 'USD',
    stack: 'backend',
    hobby: 'reading',
    salary: 'USD 4000',
  },
];

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 80, defaultEditable: false },

  salary: {
    defaultWidth: 320,
    field: 'salary',
    header: 'Salary - edit accepts numbers only',
    style: { color: 'tomato' },
    getValueToEdit: ({ value }) => {
      return parseInt(value.substr(4), 10);
    },
    getValueToPersist: ({ value, data }) => {
      return `${data!.currency} ${parseInt(value, 10)}`;
    },
    shouldAcceptEdit: ({ value }) => {
      return parseInt(value, 10) == value;
    },
  },

  firstName: {
    field: 'firstName',
    header: 'Name',
  },
  currency: {
    field: 'currency',
    header: 'Currency',
  },
};

const activeRowIndex = ref<number>(2);

let api: InfiniteTableApi<Developer> | null = null;
const onReady = ({ api: tableApi }: { api: InfiniteTableApi<Developer> }) => {
  api = tableApi;
};

const onActiveRowIndexChange = (rowIndex: number) => {
  activeRowIndex.value = rowIndex;
};

const startEdit = () => {
  api!.startEdit({
    rowIndex: activeRowIndex.value,
    columnId: 'salary',
  });
};
</script>

<template>
  <button
    :style="{
      border: '1px solid magenta',
      margin: '2px',
      padding: '10px',
      background: 'var(--infinite-background)',
      color: 'var(--infinite-cell-color)',
    }"
    @click="startEdit"
  >
    Edit the salary column for active row
  </button>

  <DataSource primaryKey="id" :data="dataSource">
    <InfiniteTable
      debugId="api-inline-editing-custom-edit-value-example"
      :onReady="onReady"
      :columns="columns"
      :columnDefaultEditable="true"
      :activeRowIndex="activeRowIndex"
      :onActiveRowIndexChange="onActiveRowIndexChange"
    />
  </DataSource>
</template>

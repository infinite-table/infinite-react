<script setup lang="ts">
import { ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

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

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers10-sql`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: Record<string, any> = {
  preferredLanguage: { field: 'preferredLanguage' },
  id: { field: 'id' },
  country: { field: 'country' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  age: { field: 'age' },
  canDesign: { field: 'canDesign' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },

  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

const activeRowIndex = ref(0);

(globalThis as any).activeRowIndex = activeRowIndex.value;

const onActiveRowIndexChange = (index: number) => {
  activeRowIndex.value = index;
  (globalThis as any).activeRowIndex = index;
};

const rowDisabledState = {
  enabledRows: true as const,
  disabledRows: [3, 5, 6],
};

const defaultRowSelection = {
  selectedRows: [5, 6, 7, 8],
  defaultSelection: false,
};

const domProps = {
  autoFocus: true,
  style: {
    height: '800px',
  },
};
</script>

<template>
  <DataSource
    primaryKey="id"
    :data="dataSource"
    selectionMode="multi-row"
    :rowDisabledState="rowDisabledState"
    :defaultRowSelection="defaultRowSelection"
  >
    <InfiniteTable
      :columns="columns"
      :activeRowIndex="activeRowIndex"
      :onActiveRowIndexChange="onActiveRowIndexChange"
      keyboardNavigation="row"
      :domProps="domProps"
    />
  </DataSource>
</template>

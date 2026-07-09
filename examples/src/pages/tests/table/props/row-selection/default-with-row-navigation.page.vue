<script setup lang="ts">
import { ref } from 'vue';

import {
  DataSource,
  InfiniteTable,
  RowSelectionState,
} from '@infinite-table/infinite-vue';

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

const columns: Record<string, any> = {
  firstName: {
    field: 'firstName',
    renderSelectionCheckBox: true,
  },
  lastName: {
    field: 'lastName',
  },
  stack: {
    field: 'stack',
  },
  preferredLanguage: {
    field: 'preferredLanguage',
  },
  age: {
    field: 'age',
  },
  canDesign: {
    field: 'canDesign',
  },
  id: { field: 'id' },
};
const domProps = {
  style: {
    height: '80vh',
  },
};

const rowSelection = ref<any>({
  selectedRows: [2, 3],
  defaultSelection: false,
});

(globalThis as any).rowSelection = rowSelection.value;

const onRowSelectionChange = (sel: any) => {
  rowSelection.value = sel;
  (globalThis as any).rowSelection = sel;
};

const onCellClick = ({ rowIndex, api, dataSourceApi }: any) => {
  const pk = dataSourceApi.getPrimaryKeyByIndex(rowIndex);
  api.rowSelectionApi.toggleRowSelection(pk);
};

const selectedCount = (sel: any) =>
  sel instanceof RowSelectionState ? sel.getSelectedCount() : false;
</script>

<template>
  <div>Selected {{ selectedCount(rowSelection) }}</div>
  <DataSource
    primaryKey="id"
    :data="data"
    selectionMode="multi-row"
    :rowSelection="rowSelection"
    :onRowSelectionChange="onRowSelectionChange"
  >
    <InfiniteTable
      :domProps="domProps"
      :columns="columns"
      :onCellClick="onCellClick"
      :keyboardSelection="true"
      keyboardNavigation="row"
      :columnDefaultWidth="200"
    />
  </DataSource>
</template>

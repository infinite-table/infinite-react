<script setup lang="ts">
import { ref } from 'vue';

import {
  DataSource,
  InfiniteTable,
  RowSelectionState,
} from '@infinite-table/infinite-vue';

import { data, height80vhDomProps } from './common';

const columns = {
  firstName: {
    field: 'firstName' as const,
    renderSelectionCheckBox: true,
  },
  lastName: {
    field: 'lastName' as const,
  },
  stack: {
    field: 'stack' as const,
  },
  preferredLanguage: {
    field: 'preferredLanguage' as const,
  },
  age: {
    field: 'age' as const,
  },
  canDesign: {
    field: 'canDesign' as const,
  },
};

const rowSelection = ref<any>({
  selectedRows: [2, 3],
  defaultSelection: false,
});

(globalThis as any).rowSelection = rowSelection.value;

const onRowSelectionChange = (sel: any) => {
  console.log('onRowSelectionChange', sel);
  rowSelection.value = sel;
  (globalThis as any).rowSelection = sel;
};

const selectedCount = (sel: any) =>
  sel instanceof RowSelectionState ? sel.getSelectedCount() : false;
</script>

<template>
  <div>Selected: {{ selectedCount(rowSelection) }}</div>
  <DataSource
    primaryKey="id"
    :data="data"
    selectionMode="multi-row"
    :rowSelection="rowSelection"
    :onRowSelectionChange="onRowSelectionChange"
  >
    <InfiniteTable
      :domProps="height80vhDomProps"
      :columns="columns"
      :keyboardSelection="true"
      keyboardNavigation="cell"
      :columnDefaultWidth="200"
    />
  </DataSource>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import {
  DataSource,
  InfiniteTable,
  RowSelectionState,
} from '@infinite-table/infinite-vue';

import { data, height80vhDomProps } from './common';

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
      :domProps="height80vhDomProps"
      :columns="columns"
      :onCellClick="onCellClick"
      :keyboardSelection="true"
      keyboardNavigation="row"
      :columnDefaultWidth="200"
    />
  </DataSource>
</template>

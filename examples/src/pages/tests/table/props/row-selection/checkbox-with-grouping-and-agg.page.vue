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
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: Record<string, any> = {
  checkbox: {
    defaultWidth: 140,
    align: 'center',
    resizable: false,

    style: {
      cursor: 'pointer',
    },

    renderSelectionCheckBox: true,
  },
  id: { field: 'id' },

  firstName: {
    field: 'firstName',
    renderSelectionCheckBox: true,
    align: 'end',
  },

  preferredLanguage: {
    field: 'preferredLanguage',
    renderSelectionCheckBox: true,

    defaultWidth: 200,
  },
  stack: { field: 'stack' },
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

const defaultGroupBy = [
  {
    field: 'stack' as const,
    column: {
      renderSelectionCheckBox: true,
    },
  },
  {
    field: 'country' as const,
  },
];

const groupColumn = {
  field: 'firstName' as const,
  defaultWidth: 200,
};

const onRowSelectionChange = (rowSelection: any) => {
  console.log(JSON.stringify(rowSelection, null, 2));
};

const selectedCount = (sel: any) =>
  sel instanceof RowSelectionState ? sel.getSelectedCount() : false;
</script>

<template>
  <div>Selected {{ selectedCount(rowSelection) }}</div>
  <DataSource
    primaryKey="id"
    :data="dataSource"
    selectionMode="multi-row"
    :defaultGroupBy="defaultGroupBy"
    :defaultRowSelection="rowSelection"
    :onRowSelectionChange="onRowSelectionChange"
  >
    <InfiniteTable
      :domProps="domProps"
      :groupColumn="groupColumn"
      groupRenderStrategy="single-column"
      :columns="columns"
      :columnDefaultWidth="100"
    />
  </DataSource>
</template>

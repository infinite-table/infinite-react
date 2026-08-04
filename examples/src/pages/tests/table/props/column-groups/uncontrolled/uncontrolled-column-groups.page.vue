<script setup lang="ts">
import { ref } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import { columns } from '../columns';
import { rowData } from '../rowData';

const getColumnGroups = () => {
  const columnGroups: Record<string, any> = {
    'contact info': { header: 'Contact info' },
    street: { header: 'street', columnGroup: 'address' },
    location: { header: 'location', columnGroup: 'address' },
    address: { header: 'Address' },
  };

  return columnGroups;
};

const collapsedColumnGroups = new Map<string[], string>();

(globalThis as any).collapsedColumnGroups = collapsedColumnGroups;

const columnGroups = ref(getColumnGroups());

(globalThis as any).columnGroups = columnGroups.value;
(globalThis as any).setColumnGroups = (updater: any) => {
  columnGroups.value =
    typeof updater === 'function' ? updater(columnGroups.value) : updater;
  (globalThis as any).columnGroups = columnGroups.value;
};

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

const columnPinning = {
  id: true,
  streetNo: true,
};
</script>

<template>
  <DataSource primaryKey="id" :data="rowData">
    <InfiniteTable
      :domProps="domProps"
      :columnPinning="columnPinning"
      :columnGroups="columnGroups"
      :pinnedStartMaxWidth="300"
      :columnDefaultWidth="240"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import sinon from 'sinon';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import { columns, developers10kDataSource } from './common';

const onColumnSizingChangeSpy = sinon.spy((_columnSizing: any) => {});
const onViewportReservedWidthChangeSpy = sinon.spy((_width: number) => {});

(globalThis as any).onColumnSizingChange = onColumnSizingChangeSpy;
(globalThis as any).onViewportReservedWidthChange =
  onViewportReservedWidthChangeSpy;

const reservedWidth = ref(0);

watchEffect(() => {
  (globalThis as any).viewportReservedWidth = reservedWidth.value;
});

const onColumnSizingChange = (columnSizing: any) => {
  onColumnSizingChangeSpy(columnSizing);
};

const onViewportReservedWidthChange = (width: number) => {
  onViewportReservedWidthChangeSpy(width);
  reservedWidth.value = width;
};

const domProps = {
  style: {
    margin: '5px',
    height: '500px',
    width: '80vw',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};
</script>

<template>
  <button @click="reservedWidth = 0">
    Fit - current reserved width is {{ reservedWidth }}
  </button>
  <DataSource :data="developers10kDataSource" primaryKey="id">
    <InfiniteTable
      :domProps="domProps"
      :columnMinWidth="50"
      :onColumnSizingChange="onColumnSizingChange"
      :viewportReservedWidth="reservedWidth"
      :onViewportReservedWidthChange="onViewportReservedWidthChange"
      :columns="columns"
    />
  </DataSource>
</template>

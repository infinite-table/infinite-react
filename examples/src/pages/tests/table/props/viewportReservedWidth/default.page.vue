<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import sinon from 'sinon';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type {
  InfiniteTablePropColumns,
  DataSourceData,
} from '@infinite-table/infinite-vue';

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

const columns: InfiniteTablePropColumns<Developer> = {
  index: {
    renderValue: ({ rowInfo }) => {
      return `${rowInfo.indexInAll}`;
    },
    defaultFlex: 1,
  },
  preferredLanguage: {
    field: 'preferredLanguage',
    header: 'This is my preferred language',
    defaultFlex: 3,
  },
  salary: {
    field: 'salary',
    type: 'number',
    defaultFlex: 2,
  },
  age: { field: 'age', defaultWidth: 150 },
};

const dataSource: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers10k-sql`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

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
  <DataSource :data="dataSource" primaryKey="id">
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

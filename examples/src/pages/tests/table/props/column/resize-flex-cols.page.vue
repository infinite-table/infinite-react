<script setup lang="ts">
import { computed, ref } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type {
  InfiniteTablePropColumns,
  DataSourceData,
} from '@infinite-table/infinite-vue';

import sinon from 'sinon';

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
    renderValue: ({ rowInfo }: any) => {
      return `${rowInfo.indexInAll}`;
    },
    defaultFlex: 1,
    renderMenuIcon: false,
  },
  preferredLanguage: {
    field: 'preferredLanguage',
    header: 'This is my preferred language',
    defaultFlex: 3,
    renderMenuIcon: false,
  },
  salary: {
    field: 'salary',
    type: 'number',
    defaultFlex: 2,
    renderMenuIcon: false,
  },
  age: { field: 'age', defaultWidth: 200, renderMenuIcon: false },
};

const dataSource: DataSourceData<Developer> = ({}) => {
  const url = process.env.NEXT_PUBLIC_BASE_URL + `/developers10-sql`;
  console.log('fetching', url);
  return fetch(url)
    .then((r) => r.json())
    .then((data: Developer[]) => {
      console.log('got response from', url, 'of lenfth', data.length);
      return data;
    });
};

const onColumnSizingChangeSpy = sinon.spy((_rowHeight: number) => {});
const onViewportReservedWidthChangeSpy = sinon.spy((_width: number) => {});

(globalThis as any).onColumnSizingChange = onColumnSizingChangeSpy;
(globalThis as any).onViewportReservedWidthChange =
  onViewportReservedWidthChangeSpy;

const initialWidth = ((globalThis as any).initialWidth = 802);

const width = ref(initialWidth);

const domProps = computed(() => ({
  style: {
    margin: '5px',
    height: '500px',
    width: `${width.value}px`,
    border: '1px solid gray',
    position: 'relative' as const,
  },
}));

const onColumnSizingChange = (columnSizing: any) => {
  onColumnSizingChangeSpy(columnSizing);
};

const onViewportReservedWidthChange = (reservedWidth: number) => {
  onViewportReservedWidthChangeSpy(reservedWidth);
};
</script>

<template>
  <button data-name="inc" @click="width = width + 100">+ 100px</button>
  <button data-name="inc" @click="width = width - 100">- 100px</button>
  <label style="color: magenta" data-name="label" :data-value="width">
    current width: {{ width }}
  </label>
  <DataSource :data="dataSource" primaryKey="id">
    <InfiniteTable
      :domProps="domProps"
      :columnMinWidth="50"
      :onColumnSizingChange="onColumnSizingChange"
      :onViewportReservedWidthChange="onViewportReservedWidthChange"
      :columns="columns"
    />
  </DataSource>
</template>

<script setup lang="ts">
import sinon from 'sinon';

import {
  InfiniteTable,
  DataSource,
  debounce,
} from '@infinite-table/infinite-vue';

import type {
  InfiniteTablePropColumns,
  DataSourceData,
  ScrollStopInfo,
} from '@infinite-table/infinite-vue';
import type { TableRenderRange } from '@src/components/VirtualBrain/MatrixBrain';

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
  },
  preferredLanguage: {
    field: 'preferredLanguage',
  },
  salary: {
    field: 'salary',
    type: 'number',
  },
  age: { field: 'age' },
  city: { field: 'city' },
  email: { field: 'email' },
  canDesign: { field: 'canDesign' },
  stack: { field: 'stack' },
};

const dataSource: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers10k-sql`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const onRenderRangeChange = sinon.spy((_scrollInfo: ScrollStopInfo) => {});

(globalThis as any).onRenderRangeChange = onRenderRangeChange;

const fn = debounce(
  (range: TableRenderRange) => {
    console.log(range);
    onRenderRangeChange(range as any);
  },
  { wait: 20 },
);

const domProps = {
  style: {
    margin: '5px',
    height: '60vh',
    width: '80vw',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};
</script>

<template>
  <DataSource :data="dataSource" primaryKey="id">
    <InfiniteTable
      :domProps="domProps"
      :columnMinWidth="50"
      :columnDefaultWidth="350"
      :onRenderRangeChange="fn"
      :columns="columns"
    />
  </DataSource>
</template>

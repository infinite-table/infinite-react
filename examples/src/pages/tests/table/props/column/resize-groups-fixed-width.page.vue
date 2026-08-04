<script setup lang="ts">
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
  salary: {
    field: 'salary',
    type: 'number',
    renderMenuIcon: false,
    columnGroup: 'test',
  },
  age: { field: 'age', columnGroup: 'test' },
  canDesign: { field: 'canDesign', columnGroup: 'test' },
  country: { field: 'country' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city', defaultWidth: 3600 },
  currency: { field: 'currency' },
};

const dataSource: DataSourceData<Developer> = ({}) => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers10k-sql`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const onColumnSizingChange = sinon.spy((_rowHeight: number) => {});

(globalThis as any).onColumnSizingChange = onColumnSizingChange;

const columnGroups = {
  test: {
    header: 'testing',
  },
};

const columnTypes = {
  default: {
    renderMenuIcon: false,
  },
};

const domProps = {
  style: {
    margin: '5px',
    height: '500px',
    width: '1000px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};
</script>

<template>
  <DataSource :data="dataSource" primaryKey="id">
    <InfiniteTable
      :domProps="domProps"
      :columnGroups="columnGroups"
      :columnTypes="columnTypes"
      :columnDefaultWidth="100"
      :columnMinWidth="50"
      :onColumnSizingChange="onColumnSizingChange"
      :columns="columns"
    />
  </DataSource>
</template>

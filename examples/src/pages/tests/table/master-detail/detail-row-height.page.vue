<script setup lang="ts">
import { h } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type {
  InfiniteTablePropColumns,
  InfiniteTableRowInfo,
} from '@infinite-table/infinite-vue';

type City = {
  id: number;
  name: string;
  country: string;
};

const data: City[] = [
  { id: 0, name: 'Paris', country: 'France' },
  { id: 1, name: 'Lyon', country: 'France' },
  { id: 2, name: 'Rome', country: 'Italy' },
  { id: 3, name: 'Milan', country: 'Italy' },
  { id: 4, name: 'Madrid', country: 'Spain' },
  { id: 5, name: 'Seville', country: 'Spain' },
];

const columns: InfiniteTablePropColumns<City> = {
  id: { field: 'id', renderRowDetailIcon: true },
  name: { field: 'name' },
  country: { field: 'country' },
};

const defaultRowDetailState = {
  expandedRows: [1],
  collapsedRows: true as const,
};

const domProps = {
  style: {
    height: '80vh',
  },
};

function renderDetail(rowInfo: InfiniteTableRowInfo<City>) {
  const id = rowInfo.id;
  return h(
    'div',
    { 'data-name': `detail-${id}`, style: { height: '100%' } },
    h(
      'button',
      {
        onClick: () => {
          (globalThis as any).detailClicks = [
            ...((globalThis as any).detailClicks || []),
            id,
          ];
        },
      },
      `Detail of ${rowInfo.data?.name}`,
    ),
  );
}
</script>

<template>
  <DataSource :data="data" primaryKey="id">
    <InfiniteTable
      :rowHeight="40"
      :rowDetailHeight="200"
      :defaultRowDetailState="defaultRowDetailState"
      :rowDetailRenderer="renderDetail"
      :domProps="domProps"
      :columns="columns"
    />
  </DataSource>
</template>

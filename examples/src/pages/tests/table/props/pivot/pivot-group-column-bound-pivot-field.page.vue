<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

type Row = {
  id: number;
  region: string;
  label: string;
  segment: string;
  amount: number;
};

defineProps<{
  groupRenderStrategy?: 'single-column' | 'multi-column' | 'inline';
}>();

const data: Row[] = [
  { id: 1, region: 'NA', label: 'Acme', segment: 'SMB', amount: 10 },
  { id: 2, region: 'NA', label: 'Globex', segment: 'Enterprise', amount: 20 },
  { id: 3, region: 'EMEA', label: 'Acme', segment: 'SMB', amount: 30 },
  { id: 4, region: 'LATAM', label: 'Acme', segment: 'SMB', amount: 5 },
  { id: 5, region: 'LATAM', label: 'Acme', segment: 'Enterprise', amount: 6 },
];

const columns: Record<string, any> = {
  id: { field: 'id' },
  region: { field: 'region' },
  label: { field: 'label' },
  segment: { field: 'segment' },
  amount: { field: 'amount', type: 'number' },
};

const sumReducer = {
  initialValue: 0,
  reducer: (acc: number, value: number) => acc + value,
};

const reducers = {
  amount: {
    ...sumReducer,
    name: 'Amount',
    field: 'amount' as const,
  },
};

const groupBy = [
  { field: 'region' as const, column: { field: 'segment' as const } },
  { field: 'label' as const },
];
const pivotBy = [{ field: 'segment' as const }];

const domProps = {
  style: {
    height: '80vh',
  },
};
</script>

<template>
  <DataSource
    primaryKey="id"
    :data="data"
    :groupBy="groupBy"
    :pivotBy="pivotBy"
    :aggregationReducers="reducers"
  >
    <template #default="{ pivotColumns, pivotColumnGroups }">
      <InfiniteTable
        :domProps="domProps"
        :columns="columns"
        :groupRenderStrategy="groupRenderStrategy"
        :pivotColumns="pivotColumns"
        :pivotColumnGroups="pivotColumnGroups"
      />
    </template>
  </DataSource>
</template>

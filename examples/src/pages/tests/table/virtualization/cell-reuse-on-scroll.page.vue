<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-vue';

type Row = {
  id: number;
  name: string;
  value: number;
  code: string;
};

const data: Row[] = Array.from({ length: 10_000 }, (_, i) => ({
  id: i,
  name: `row ${i}`,
  value: i * 2,
  code: `c${i % 997}`,
}));

const columns: InfiniteTablePropColumns<Row> = {
  id: { field: 'id', type: 'number' },
  name: { field: 'name' },
  value: { field: 'value', type: 'number' },
  code: { field: 'code' },
};

const domProps = { style: { height: '600px', width: '800px' } };
</script>

<template>
  <DataSource primaryKey="id" :data="data">
    <InfiniteTable
      :columns="columns"
      :rowHeight="40"
      :columnDefaultWidth="150"
      :domProps="domProps"
    />
  </DataSource>
</template>

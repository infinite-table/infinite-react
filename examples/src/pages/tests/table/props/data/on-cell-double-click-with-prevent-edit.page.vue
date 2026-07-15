<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import type { CarSale } from '@examples/datasets/CarSale';

import { carsales, carSaleBasicColumns as columns } from './common';

const onCellDoubleClick = (context: any) => {
  if (context.column.field === 'model') {
    return {
      preventEdit: true,
    };
  }
  return;
};

const domProps = {
  style: {
    margin: '5px',
    height: '900px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};
</script>

<template>
  <DataSource :data="carsales" primaryKey="id">
    <InfiniteTable
      :domProps="domProps"
      :onCellDoubleClick="onCellDoubleClick"
      :columnDefaultEditable="true"
      :columns="columns"
    />
  </DataSource>
</template>

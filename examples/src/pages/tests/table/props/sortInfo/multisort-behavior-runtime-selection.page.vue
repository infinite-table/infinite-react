<script setup lang="ts">
import { ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { getOrders } from './getOrders';

const orders = getOrders();
const defaultSortInfo: any[] = [];

const multiSortBehavior = ref<'append' | 'replace'>('replace');

const onMultiSortBehaviorChange = (event: Event) => {
  multiSortBehavior.value = (event.target as HTMLSelectElement).value as
    | 'append'
    | 'replace';
};

const selectStyle = {
  margin: '10px 0',
  display: 'inline-block',
  background: 'var(--infinite-background)',
  color: 'var(--infinite-cell-color)',
  padding: 'var(--infinite-space-3)',
};

const columns = {
  orderId: {
    field: 'OrderId' as const,
    type: 'number',
  },
  companyName: {
    field: 'CompanyName' as const,
  },
  itemCount: { field: 'ItemCount' as const, type: 'number' },
  orderCost: { field: 'OrderCost' as const, type: 'number' },
};

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};
</script>

<template>
  <select
    :style="selectStyle"
    :value="multiSortBehavior"
    @change="onMultiSortBehaviorChange"
  >
    <option value="replace">replace</option>
    <option value="append">append</option>
  </select>
  <DataSource
    :data="orders"
    primaryKey="OrderId"
    :defaultSortInfo="defaultSortInfo"
  >
    <InfiniteTable
      :domProps="domProps"
      :rowHeight="40"
      :multiSortBehavior="multiSortBehavior"
      :columnDefaultWidth="150"
      :columns="columns"
    />
  </DataSource>
</template>

<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import sinon from 'sinon';

import { getOrders } from './getOrders';
import type { Order } from './getOrders';

const orders = getOrders();

const onSortInfoChange = sinon.spy((_sortInfo: any) => {});

(globalThis as any).onSortInfoChange = onSortInfoChange;

const columns = {
  OrderId: {
    field: 'OrderId' as keyof Order,
    type: 'number',
  },
  CompanyName: {
    field: 'CompanyName' as keyof Order,
  },
  ItemCount: { field: 'ItemCount' as keyof Order, type: 'number' },
  OrderCost: { field: 'OrderCost' as keyof Order, type: 'number' },
  ShipCountry: { field: 'ShipCountry' as keyof Order },
  ShipVia: { field: 'ShipVia' as keyof Order },
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
  <DataSource
    :data="orders"
    :onSortInfoChange="onSortInfoChange"
    primaryKey="OrderId"
  >
    <InfiniteTable
      :domProps="domProps"
      :rowHeight="40"
      :columnDefaultWidth="150"
      :columns="columns"
    />
  </DataSource>
</template>

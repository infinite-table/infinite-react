<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import sinon from 'sinon';

import { getOrders } from './getOrders';

const orders = getOrders();

const onSortInfoChange = sinon.spy((_sortInfo: any) => {});

const defaultSortInfo = [
  {
    dir: 1,
    id: 'itemCount',
    // field: 'ItemCount',
  },
  // {
  //   dir: 1,
  //   field: 'ItemCount',
  // },
  { dir: 1, field: 'CompanyName' as const },
];

(globalThis as any).defaultSortInfo = defaultSortInfo;
(globalThis as any).onSortInfoChange = onSortInfoChange;

const columns = {
  orderId: {
    field: 'OrderId' as const,
    type: 'number',
  },
  companyName: {
    field: 'CompanyName' as const,
  },
  itemCount: { field: 'ItemCount' as const, type: 'number' },
  itemCount2: { field: 'ItemCount' as const, type: 'number' },
  orderCost: { field: 'OrderCost' as const, type: 'number' },
  shipCountry: { field: 'ShipCountry' as const },
  shipVia: { field: 'ShipVia' as const },
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
    :defaultSortInfo="defaultSortInfo"
  >
    <InfiniteTable
      :domProps="domProps"
      :rowHeight="40"
      :columnDefaultWidth="150"
      :columns="columns"
    />
  </DataSource>
</template>

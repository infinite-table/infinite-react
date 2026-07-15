<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { orders } from './orders-dataset';

const defaultSortInfo: any[] = [];

const sortTypes = {
  date: (a: any, b: any) => {
    return b - a;
  },
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
  shipDate: {
    field: 'ShipDate' as const,
    defaultWidth: 200,
    type: 'date',
    valueFormatter: ({ value }: { value: any }) => value.toLocaleDateString(),
  },
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
    primaryKey="OrderId"
    :defaultSortInfo="defaultSortInfo"
    :sortTypes="sortTypes"
  >
    <InfiniteTable
      :domProps="domProps"
      :columnDefaultWidth="150"
      :columns="columns"
    />
  </DataSource>
</template>

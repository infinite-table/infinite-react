<script setup lang="ts">
import { computed, ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { getOrders, multisort } from './getOrders';
import type { Order } from './getOrders';

const sortInfo = ref<any>({
  dir: 1,
  field: 'CompanyName',
});

const enabled = ref(false);

const orders = computed(() => {
  const orders: Order[] = [...getOrders()];
  return multisort(
    Array.isArray(sortInfo.value)
      ? sortInfo.value
      : sortInfo.value
      ? [sortInfo.value]
      : [],
    orders,
  );
});

const toggleEnabled = () => {
  enabled.value = !enabled.value;
};

const onSortInfoChange = (newSortInfo: any) => {
  console.log(newSortInfo);
  if (enabled.value) {
    sortInfo.value = newSortInfo;
  }
};

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

const columns = {
  OrderId: {
    field: 'OrderId' as const,
    type: 'number',
  },
  CompanyName: {
    field: 'CompanyName' as const,
  },
  ItemCount: { field: 'ItemCount' as const, type: 'number' },
  OrderCost: { field: 'OrderCost' as const, type: 'number' },
  ShipCountry: { field: 'ShipCountry' as const },
  ShipVia: { field: 'ShipVia' as const },
};
</script>

<template>
  <div>
    <p>Currently the sorting is {{ enabled ? 'enabled' : 'disabled' }}</p>
    <button id="toggle-sortInfo" @click="toggleEnabled">
      Toggle - click the toggle to
      {{ enabled ? 'disable' : 'enable' }} sortInfo
    </button>
    <DataSource
      :data="orders"
      primaryKey="OrderId"
      :sortInfo="sortInfo"
      :onSortInfoChange="onSortInfoChange"
    >
      <InfiniteTable
        :domProps="domProps"
        :rowHeight="40"
        :columnDefaultWidth="150"
        :columns="columns"
      />
    </DataSource>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import type { CarSale } from '@examples/datasets/CarSale';

import { carsales, carSaleBasicColumns as columns } from './common';

const simpleColumns = { make: columns.make };

const active = ref([true, true]);

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
  <button @click="active = [!active[0], active[1]]">toggle test</button>
  <DataSource v-if="active[0]" :data="carsales" primaryKey="id">
    <InfiniteTable debugId="test" :domProps="domProps" :columns="columns" />
  </DataSource>
  <button @click="active = [active[0], !active[1]]">Toggle simple</button>
  <DataSource
    v-if="active[1]"
    :data="carsales"
    primaryKey="id"
    selectionMode="multi-row"
  >
    <InfiniteTable
      debugId="simple"
      :domProps="domProps"
      :columns="simpleColumns"
    />
  </DataSource>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import { carsales, columns, rowHeightDomProps } from './common';

const rowHeight = ref(40);
</script>

<template>
  Current row height: {{ rowHeight }}
  <br />
  Press buttons below to increment/decrement row height by 10
  <div style="display: flex; flex-flow: row">
    <button data-name="up" @click="rowHeight = rowHeight + 10">UP</button>
    <button data-name="down" @click="rowHeight = rowHeight - 10">DOWN</button>
  </div>
  <DataSource :data="carsales" primaryKey="id">
    <InfiniteTable
      :domProps="rowHeightDomProps"
      :rowHeight="rowHeight"
      :columns="columns"
    />
  </DataSource>
</template>

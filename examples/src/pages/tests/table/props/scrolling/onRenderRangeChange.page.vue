<script setup lang="ts">
import sinon from 'sinon';

import {
  InfiniteTable,
  DataSource,
  debounce,
} from '@infinite-table/infinite-vue';

import type { ScrollStopInfo } from '@infinite-table/infinite-vue';
import type { TableRenderRange } from '@src/components/VirtualBrain/MatrixBrain';

import {
  columns,
  developers10kDataSource,
  renderRangeDomProps,
} from './common';

const onRenderRangeChange = sinon.spy((_scrollInfo: ScrollStopInfo) => {});

(globalThis as any).onRenderRangeChange = onRenderRangeChange;

const fn = debounce(
  (range: TableRenderRange) => {
    console.log(range);
    onRenderRangeChange(range as any);
  },
  { wait: 20 },
);
</script>

<template>
  <DataSource :data="developers10kDataSource" primaryKey="id">
    <InfiniteTable
      :domProps="renderRangeDomProps"
      :columnMinWidth="50"
      :columnDefaultWidth="350"
      :onRenderRangeChange="fn"
      :columns="columns"
    />
  </DataSource>
</template>

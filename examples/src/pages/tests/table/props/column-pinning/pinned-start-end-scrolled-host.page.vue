<script setup lang="ts">
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import {
  GRID_HEIGHT,
  GRID_WIDTH,
  ROW_HEIGHT,
  columnPinning,
  getColumns,
  rows,
} from './pinnedStartEndData';

// the grid is inside a scrolling container (#host), itself in a scrolling
// page (#page - the test app's root is a fixed-height flex column, so the
// page brings its own scrolling element)
const columns = getColumns();

const domProps = {
  style: {
    width: `${GRID_WIDTH}px`,
    height: `${GRID_HEIGHT}px`,
    border: '1px solid gray',
  },
};

const onReady = ({ api }: { api: any }) => {
  (globalThis as any).api = api;
};
</script>

<template>
  <div id="page" style="flex: 1 1 0; min-height: 0; overflow: auto">
    <div style="height: 150px">page content above</div>
    <div
      id="host"
      style="
        height: 520px;
        width: 1200px;
        overflow: auto;
        border: 2px solid tomato;
        margin-left: 30px;
      "
    >
      <div style="height: 260px">host content above</div>
      <div style="margin-left: 120px; width: 1600px">
        <DataSource primaryKey="id" :data="rows">
          <InfiniteTable
            :domProps="domProps"
            :rowHeight="ROW_HEIGHT"
            :columnPinning="columnPinning"
            :columns="columns"
            :onReady="onReady"
          />
        </DataSource>
      </div>
      <div style="height: 700px">host content below</div>
    </div>
    <div style="height: 2000px">page content below</div>
  </div>
</template>

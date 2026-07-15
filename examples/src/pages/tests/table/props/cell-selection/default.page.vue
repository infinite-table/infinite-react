<script setup lang="ts">
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type { DataSourcePropCellSelection_MultiCell } from '@infinite-table/infinite-vue';

import {
  columns,
  developers1kDataSource,
  height80vhDomProps,
} from './common';

const cellSelection: DataSourcePropCellSelection_MultiCell = {
  selectedCells: [
    // [2, 'firstName'],
    ['*', 'firstName'],
    // [7, 'preferredLanguage'],
    // [3, 'id'],
    [3, '*'],
    [4, '*'],
    [5, '*'],
    [11, 'preferredLanguage'],
    [15, 'stack'],
  ],
  // deselectedCells: [[3, 'stack']],
  defaultSelection: false,
};

const columnPinning = {
  // firstName: 'start',
};
</script>

<template>
  <DataSource
    primaryKey="id"
    :data="developers1kDataSource"
    selectionMode="multi-cell"
    :defaultCellSelection="cellSelection"
  >
    <InfiniteTable
      :columnPinning="columnPinning"
      debugId="test"
      :domProps="height80vhDomProps"
      :columns="columns"
      :keyboardSelection="true"
      keyboardNavigation="cell"
      :columnDefaultWidth="200"
    />
  </DataSource>
</template>

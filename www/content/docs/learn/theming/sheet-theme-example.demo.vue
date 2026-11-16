<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-vue';

import '@infinite-table/infinite-vue/theme/sheet.css';

type Row = { id: number; region: string; q1: number; q2: number; q3: number };

const REGIONS = ['North', 'South', 'East', 'West', 'Central'];

const data: Row[] = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  region: REGIONS[i % REGIONS.length],
  q1: 1000 + ((i * 337) % 900),
  q2: 1000 + ((i * 511) % 900),
  q3: 1000 + ((i * 719) % 900),
}));

const columns: InfiniteTablePropColumns<Row> = {
  // a pinned row number column - styled like the row headers of a spreadsheet
  rowNumber: {
    header: '',
    defaultWidth: 50,
    align: 'center',
    renderValue: ({ rowInfo }) => rowInfo.indexInAll + 1,
  },
  region: { field: 'region', header: 'Region' },
  q1: { field: 'q1', header: 'Q1', type: 'number' },
  q2: { field: 'q2', header: 'Q2', type: 'number' },
  q3: { field: 'q3', header: 'Q3', type: 'number' },
};
</script>

<template>
  <div class="infinite-theme-name--sheet" :style="{ display: 'flex', flex: 1 }">
    <DataSource :data="data" primaryKey="id">
      <InfiniteTable
        :columns="columns"
        :defaultColumnPinning="{ rowNumber: 'start' }"
        keyboardNavigation="cell"
        :defaultActiveCellIndex="[2, 2]"
      />
    </DataSource>
  </div>
</template>

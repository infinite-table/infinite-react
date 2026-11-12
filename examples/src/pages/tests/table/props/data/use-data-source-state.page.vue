<script setup lang="ts">
import { defineComponent, h } from 'vue';

import {
  DataSource,
  InfiniteTable,
  useDataSourceState,
} from '@infinite-table/infinite-vue';
import type { DataSourceState } from '@infinite-table/infinite-vue';
import type { CarSale } from '@examples/datasets/CarSale';

import { carsales, carSaleBasicColumns as columns } from './common';

const domProps = {
  style: {
    margin: '5px',
    height: '900px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

const AppGrid = defineComponent({
  name: 'AppGrid',
  setup() {
    const dataArrayLength = useDataSourceState(
      (state: DataSourceState<CarSale>) => state.dataArray.length,
    );

    return () => {
      return h('div', [
        h(
          'p',
          { 'data-name': 'test' },
          `Showing ${dataArrayLength.value} rows.`,
        ),
        h(InfiniteTable, {
          debugId: 'test',
          domProps,
          columns,
        }),
      ]);
    };
  },
});

const groupRowsState = {
  expandedRows: true as const,
  collapsedRows: [[2010]],
};

const defaultGroupBy = [{ field: 'year' as const }];
</script>

<template>
  <DataSource
    :data="carsales"
    primaryKey="id"
    :defaultGroupBy="defaultGroupBy"
    :defaultGroupRowsState="groupRowsState"
  >
    <AppGrid />
  </DataSource>
</template>

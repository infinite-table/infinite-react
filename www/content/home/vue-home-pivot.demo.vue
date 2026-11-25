<script setup lang="ts">
/**
 * The pivot demo of the Vue home page (/vue): the Vue port of
 * src/components/home/demos/PivotDemo.tsx, with the same card and data. The
 * home page shows this page in an iframe (FrameDemo.tsx), as tall as the
 * code next to it.
 */
import '@infinite-table/infinite-vue/index.css';
import '@infinite-table/infinite-vue/theme/terminal.css';

import './home-demo/page.css';

import { h } from 'vue';
import {
  DataSource,
  InfiniteTable,
  type DataSourcePropAggregationReducers,
  type DataSourcePropGroupBy,
  type DataSourcePropPivotBy,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-vue';

import {
  type Trade,
  formatMoney,
  makeTrades,
} from '../../src/components/home/demos/data';
import { themeClassName } from '../../src/components/home/demos/theme';
import { useSiteMode } from './vue-home/frame';

// the same code as the snippet next to the demo (VueHomePage.tsx)
const groupBy: DataSourcePropGroupBy<Trade> = [{ field: 'sector' }];
const pivotBy: DataSourcePropPivotBy<Trade> = [{ field: 'region' }];

const sum = (acc: number, value: number) => acc + value;
const reducers: DataSourcePropAggregationReducers<Trade> = {
  pnl: {
    field: 'pnl',
    initialValue: 0,
    reducer: sum,
    name: 'P&L',
    pivotColumn: { defaultFlex: 1, minWidth: 104 },
  },
  notional: {
    field: 'notional',
    initialValue: 0,
    reducer: sum,
    name: 'Notional',
    pivotColumn: { defaultFlex: 1, minWidth: 104 },
  },
};

// the generated pivot columns take their rendering from these
const columns: InfiniteTablePropColumns<Trade> = {
  sector: { field: 'sector', header: 'Sector' },
  region: { field: 'region', header: 'Region' },
  pnl: {
    field: 'pnl',
    header: 'P&L',
    type: 'number',
    align: 'end',
    renderValue: ({ value }) =>
      value == null
        ? null
        : h(
            'span',
            { class: value < 0 ? 'home-down' : 'home-up' },
            formatMoney(value),
          ),
  },
  notional: {
    field: 'notional',
    header: 'Notional',
    type: 'number',
    align: 'end',
    renderValue: ({ value }) => (value == null ? null : formatMoney(value)),
  },
};

const groupColumn = { header: 'Sector', defaultWidth: 170 };

const mode = useSiteMode();
const data = makeTrades(20_000);
</script>

<template>
  <div class="home home-demo home-demo--pivot home-demo--fill">
    <div class="home-demo__card">
      <div
        class="home-demo__grid home-grid--site"
        :class="themeClassName('terminal', mode)"
      >
        <DataSource
          :data="data"
          primaryKey="id"
          :groupBy="groupBy"
          :pivotBy="pivotBy"
          :aggregationReducers="reducers"
        >
          <template #default="{ pivotColumns, pivotColumnGroups }">
            <InfiniteTable
              :columns="columns"
              :pivotColumns="pivotColumns"
              :pivotColumnGroups="pivotColumnGroups"
              pivotTotalColumnPosition="end"
              :domProps="{ style: { height: '100%' } }"
              :columnDefaultWidth="128"
              :groupColumn="groupColumn"
            />
          </template>
        </DataSource>
      </div>
    </div>
  </div>
</template>

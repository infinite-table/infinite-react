<script setup lang="ts">
/**
 * The million rows demo of the Vue home page (/vue): the Vue port of
 * src/components/home/demos/MillionRowsDemo.tsx, with the same card, data and
 * controls. The home page shows this page in an iframe (VueFrameDemo.tsx).
 */
import '@infinite-table/infinite-vue/index.css';
import '@infinite-table/infinite-vue/theme/terminal.css';

import './vue-home/page.css';

import { h, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue';
import {
  DataSource,
  InfiniteTable,
  type InfiniteTableApi,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-vue';

import {
  type Instrument,
  formatCompact,
  formatInt,
  formatPct,
  makeInstrumentsChunked,
  nameFor,
} from '../../src/components/home/demos/data';
import { themeClassName } from '../../src/components/home/demos/theme';
import { useReportHeight, useSiteMode } from './vue-home/frame';

/** A million rows where there's room for them; 100k on phones. */
function rowCount() {
  const small = window.matchMedia('(max-width: 767px)').matches;
  const lowMemory =
    'deviceMemory' in navigator && (navigator as any).deviceMemory < 4;
  return small || lowMemory ? 100_000 : 1_000_000;
}

const derived = (
  header: string,
  fn: (row: Instrument) => number,
  digits = 2,
): InfiniteTablePropColumns<Instrument>[string] => ({
  header,
  type: 'number',
  align: 'end',
  defaultWidth: 110,
  valueGetter: ({ data }) => fn(data),
  renderValue: ({ value }) => (value == null ? null : value.toFixed(digits)),
});

const columns: InfiniteTablePropColumns<Instrument> = {
  id: {
    field: 'id',
    header: '#',
    type: 'number',
    align: 'end',
    defaultWidth: 110,
    renderValue: ({ value }) => formatInt(value + 1),
  },
  symbol: { field: 'symbol', header: 'Symbol', defaultWidth: 100 },
  name: {
    header: 'Name',
    valueGetter: ({ data }) => nameFor(data.id),
    defaultWidth: 230,
  },
  sector: { field: 'sector', header: 'Sector', defaultWidth: 150 },
  price: {
    field: 'price',
    header: 'Price',
    type: 'number',
    align: 'end',
    defaultWidth: 100,
    renderValue: ({ value }) => (value == null ? null : value.toFixed(2)),
  },
  changePct: {
    field: 'changePct',
    header: 'Chg %',
    type: 'number',
    align: 'end',
    defaultWidth: 100,
    renderValue: ({ value }) =>
      value == null
        ? null
        : h(
            'span',
            { class: value < 0 ? 'home-down' : 'home-up' },
            formatPct(value),
          ),
  },
  volume: {
    field: 'volume',
    header: 'Volume',
    type: 'number',
    align: 'end',
    defaultWidth: 110,
    renderValue: ({ value }) => (value == null ? null : formatCompact(value)),
  },
  bid: derived('Bid', (d) => d.price * 0.9996),
  ask: derived('Ask', (d) => d.price * 1.0004),
  open: derived('Open', (d) => d.price / (1 + d.changePct / 100)),
  high: derived('High', (d) => d.price * 1.012),
  low: derived('Low', (d) => d.price * 0.987),
  region: { field: 'region', header: 'Region', defaultWidth: 110 },
  beta: derived('Beta', (d) => 0.4 + ((d.id * 37) % 160) / 100),
  pe: derived('P/E', (d) => 6 + ((d.id * 53) % 420) / 10, 1),
  position: derived('Position', (d) => ((d.id * 97) % 9000) * 10, 0),
};

const COLUMN_COUNT = Object.keys(columns).length;

const root = ref<HTMLElement | null>(null);
useReportHeight(root);

const mode = useSiteMode();
const count = rowCount();
const data = shallowRef<Instrument[] | null>(null);
const progress = ref(0);
const buildMs = ref(0);
const range = ref<[number, number] | null>(null);
let api: InfiniteTableApi<Instrument> | null = null;

const controller = new AbortController();
let timer = 0;

onMounted(() => {
  const start = performance.now();
  makeInstrumentsChunked(
    count,
    (done) => (progress.value = done),
    controller.signal,
  ).then((rows) => {
    buildMs.value = Math.round(performance.now() - start);
    data.value = rows;
    timer = window.setInterval(() => {
      const renderRange = api?.getVisibleRenderRange();
      if (renderRange) {
        range.value = [renderRange.start[0], renderRange.end[0]];
      }
    }, 250);
  });
});

onBeforeUnmount(() => {
  controller.abort();
  clearInterval(timer);
});

const onReady = (ready: { api: InfiniteTableApi<Instrument> }) => {
  api = ready.api;
};

const jump = (fraction: number) => {
  if (api) {
    api.scrollTop = Math.round(fraction * api.scrollTopMax);
  }
};
</script>

<template>
  <div ref="root" class="home home-demo home-demo--million">
    <div class="home-demo__card">
      <div class="home-demo__bar">
        <span class="home-demo__readout">
          <b>{{ formatInt(count) }}</b> rows × {{ COLUMN_COUNT }} columns
          <template v-if="data">
            · data built in {{ formatInt(buildMs) }} ms</template
          >
          <template v-if="range">
            · rows
            <b>{{ formatInt(range[0] + 1) }}–{{ formatInt(range[1]) }}</b>
            in view</template
          >
        </span>
        <span class="home-demo__spacer" />
        <button type="button" class="site-key site-key--sm" @click="jump(0)">
          Top
        </button>
        <button
          type="button"
          class="site-key site-key--sm"
          @click="jump(0.05 + Math.random() * 0.9)"
        >
          Random row
        </button>
        <button type="button" class="site-key site-key--sm" @click="jump(1)">
          Bottom
        </button>
      </div>
      <div
        class="home-demo__grid home-grid--site"
        :class="themeClassName('terminal', mode, 'compact')"
      >
        <DataSource v-if="data" :data="data" primaryKey="id">
          <InfiniteTable
            :columns="columns"
            :domProps="{ style: { height: '100%' } }"
            :columnDefaultWidth="110"
            :onReady="onReady"
          />
        </DataSource>
        <div v-else class="home-demo__loading">
          building {{ formatInt(progress) }} / {{ formatInt(count) }} rows…
        </div>
      </div>
    </div>
  </div>
</template>

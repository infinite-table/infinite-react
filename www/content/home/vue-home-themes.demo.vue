<script setup lang="ts">
/**
 * The themes demo of the Vue home page (/vue): the Vue port of
 * src/components/home/demos/ThemesDemo.tsx, with the same card, data and
 * controls. The home page shows this page in an iframe (VueFrameDemo.tsx).
 */
import '@infinite-table/infinite-vue/index.css';
// the default theme is in index.css
import '@infinite-table/infinite-vue/theme/terminal.css';
import '@infinite-table/infinite-vue/theme/sheet.css';
import '@infinite-table/infinite-vue/theme/paper.css';
import '@infinite-table/infinite-vue/theme/minimalist.css';
import '@infinite-table/infinite-vue/theme/ocean.css';
import '@infinite-table/infinite-vue/theme/balsam.css';

import './vue-home/page.css';

import { computed, h, ref, watch } from 'vue';
import {
  DataSource,
  InfiniteTable,
  type DataSourcePropAggregationReducers,
  type DataSourcePropGroupBy,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-vue';

import {
  type Instrument,
  formatCompact,
  formatPct,
  makeInstruments,
  nameFor,
} from '../../src/components/home/demos/data';
import {
  type ColorMode,
  themeClassName,
} from '../../src/components/home/demos/theme';
import { useReportHeight, useSiteMode } from './vue-home/frame';
import Segmented from './vue-home/Segmented.vue';

const THEMES = [
  { id: 'terminal', label: 'Terminal' },
  { id: 'sheet', label: 'Sheet' },
  { id: 'paper', label: 'Paper' },
  { id: 'default', label: 'Default' },
  { id: 'minimalist', label: 'Minimalist' },
  { id: 'ocean', label: 'Ocean' },
  { id: 'balsam', label: 'Balsam' },
] as const;
type ThemeId = (typeof THEMES)[number]['id'];

const MODES = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
] as const;

const DENSITIES = [
  { id: 'compact', label: 'Compact' },
  { id: 'comfortable', label: 'Comfortable' },
  { id: 'spacious', label: 'Spacious' },
] as const;
type DensityId = (typeof DENSITIES)[number]['id'];

const groupBy: DataSourcePropGroupBy<Instrument> = [{ field: 'sector' }];

const reducers: DataSourcePropAggregationReducers<Instrument> = {
  volume: {
    field: 'volume',
    initialValue: 0,
    reducer: (acc: number, value: number) => acc + value,
  },
  changePct: {
    field: 'changePct',
    initialValue: 0,
    reducer: (acc: number, value: number) => acc + value,
    done: (sum: number, rows: Instrument[]) =>
      rows.length ? sum / rows.length : 0,
  },
};

const columns: InfiniteTablePropColumns<Instrument> = {
  symbol: { field: 'symbol', header: 'Symbol', defaultWidth: 100 },
  name: {
    header: 'Name',
    valueGetter: ({ data }) => nameFor(data.id),
    defaultFlex: 1,
    minWidth: 190,
  },
  sector: { field: 'sector', header: 'Sector' },
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
  region: { field: 'region', header: 'Region', defaultWidth: 110 },
};

const groupColumn = { header: 'Sector', defaultWidth: 190 };
const columnVisibility = { sector: false } as const;

const root = ref<HTMLElement | null>(null);
useReportHeight(root);

const siteMode = useSiteMode();
const theme = ref<ThemeId>('terminal');
const mode = ref<ColorMode>(siteMode.value);
const density = ref<DensityId>('comfortable');
const copied = ref(false);

// follow the site toggle; the Mode control can still flip it here
watch(siteMode, (next) => (mode.value = next));

const data = makeInstruments(3000);

const className = computed(() =>
  themeClassName(theme.value, mode.value, density.value),
);
// The keyword is built from parts: the demo build would read a whole import
// statement in a string as one of this file's imports.
const IMPORT = ['im', 'port'].join('');
const cssImport = (path: string) =>
  `${IMPORT} '@infinite-table/infinite-vue/${path}';`;
const snippet = computed(() => {
  const cssImports = [
    cssImport('index.css'),
    ...(theme.value === 'default' ? [] : [cssImport(`theme/${theme.value}.css`)]),
  ].join('\n');
  return `${cssImports}\n\n<div class="${className.value}">\n  <InfiniteTable />\n</div>`;
});

const copy = () => {
  navigator.clipboard?.writeText(snippet.value).catch(() => {});
  copied.value = true;
  window.setTimeout(() => (copied.value = false), 1500);
};
</script>

<template>
  <div ref="root" class="home home-demo home-demo--themes">
    <div class="home-demo__card">
      <div class="home-demo__bar home-demo__bar--wrap">
        <Segmented
          label="Theme"
          :options="THEMES"
          :value="theme"
          @change="theme = $event"
        />
        <Segmented
          label="Mode"
          :options="MODES"
          :value="mode"
          @change="mode = $event"
        />
        <Segmented
          label="Density"
          :options="DENSITIES"
          :value="density"
          @change="density = $event"
        />
      </div>
      <div class="home-demo__grid" :class="className">
        <DataSource
          :data="data"
          primaryKey="id"
          :groupBy="groupBy"
          :aggregationReducers="reducers"
        >
          <InfiniteTable
            :columns="columns"
            :domProps="{ style: { height: '100%' } }"
            :columnDefaultWidth="130"
            :groupColumn="groupColumn"
            :defaultColumnVisibility="columnVisibility"
          />
        </DataSource>
      </div>
      <div class="home-demo__snippet">
        <pre><code>{{ snippet }}</code></pre>
        <button type="button" class="site-key site-key--sm" @click="copy">
          {{ copied ? 'Copied' : 'Copy' }}
        </button>
      </div>
    </div>
  </div>
</template>

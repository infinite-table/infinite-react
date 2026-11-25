<script setup lang="ts">
/**
 * The hero of the Vue home page (/vue): a ticking trading blotter (the Vue
 * Infinite Table fed by a Web Worker simulation), charts fed by the same
 * stream, a control bar, and a scripted "live control" show that hands over
 * on the first interaction.
 *
 * The Vue port of src/components/hero/HeroDemo.tsx. The feed, the worker,
 * the script of the show, the chart drawing and the styles have no framework
 * code and are shared with the React hero; the components are in ./vue-hero.
 * The home page shows this demo's page in an iframe (HeroFrameShowcase.tsx).
 */
import '@infinite-table/infinite-vue/index.css';
// extra grid themes the hero can switch to (the default one is in index.css)
import '@infinite-table/infinite-vue/theme/terminal.css';
import '@infinite-table/infinite-vue/theme/sheet.css';
import '@infinite-table/infinite-vue/theme/paper.css';

import '../../node_modules/@thedatagrid/docs-kit/dist/showcase/styles.css';
import '../../src/components/hero/hero-tokens.css';
import '../../src/components/hero/hero.css';

import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
  watchEffect,
} from 'vue';
import type { DataSourceGroupBy } from '@infinite-table/infinite-vue';
import type { ShowcaseScriptContext } from '@thedatagrid/docs-kit/showcase';

import { HeroFeed } from '../../src/components/hero/data/feed';
import type { Instrument } from '../../src/components/hero/data/instruments';
import { formatInt } from '../../src/components/hero/format';
import {
  resetHeroState,
  runHeroScript,
  type HeroController,
} from '../../src/components/hero/heroScript';
import {
  BUILD_MESSAGE_THRESHOLD,
  DEFAULT_ROW_COUNT,
  DEFAULT_TICK_RATE,
  REDUCED_MOTION_TICK_CAP,
  canHandleMillionRows,
  type HeroDataMode,
  type HeroView,
} from '../../src/components/hero/heroTypes';
import {
  DEFAULT_DENSITY_ID,
  DEFAULT_THEME_ID,
  getHeroDensity,
  themeClassName,
  type HeroDensity,
} from '../../src/components/hero/themes';
import AutomatedDemo from './vue-hero/AutomatedDemo.vue';
import {
  useColorMode,
  useInView,
  usePageVisible,
  usePrefersReducedMotion,
} from './vue-hero/composables';
import ControlBar from './vue-hero/ControlBar.vue';
import DataControls from './vue-hero/DataControls.vue';
import Heatmap from './vue-hero/Heatmap.vue';
import HeroGrid, { type HeroGridApis } from './vue-hero/HeroGrid.vue';
import PriceChart from './vue-hero/PriceChart.vue';
import SectorBars from './vue-hero/SectorBars.vue';
import StatsStrip from './vue-hero/StatsStrip.vue';

const GROUP_BY_SECTOR: DataSourceGroupBy<Instrument>[] = [{ field: 'sector' }];
const NO_GROUPS: DataSourceGroupBy<Instrument>[] = [];

// `?autoplay=0` turns the scripted show off
const autoplay = new URLSearchParams(location.search).get('autoplay') !== '0';

// The tick worker is an entry of this page's import map (docs-kit.config.mjs).
const feed = new HeroFeed({
  createWorker: () =>
    new Worker(import.meta.resolve('hero-tick-worker'), {
      type: 'module',
      name: 'hero-ticks',
    }),
});

const root = ref<HTMLElement | null>(null);
const reducedMotion = usePrefersReducedMotion();
const pageVisible = usePageVisible();
const inView = useInView(root);
const mode = useColorMode();

const themeId = ref(DEFAULT_THEME_ID);
const densityId = ref<HeroDensity['id']>(DEFAULT_DENSITY_ID);
const ticksPerSecond = ref(DEFAULT_TICK_RATE);
const rowCount = ref(DEFAULT_ROW_COUNT);
const dataMode = ref<HeroDataMode>('client');
const groupBy = shallowRef(NO_GROUPS);
const pivot = ref(false);
const selectedId = ref(-1);
// shallow: up to a million rows, which the grid owns
const rows = shallowRef<Instrument[] | null>(null);
const building = ref<string | null>(null);
const apis = shallowRef<HeroGridApis | null>(null);
const allowMillion = canHandleMillionRows();

const density = computed(() => getHeroDensity(densityId.value));
const view = computed<HeroView>(() =>
  pivot.value ? 'pivot' : groupBy.value.length ? 'grouped' : 'flat',
);
const running = computed(() => pageVisible.value && inView.value);
const themeKey = computed(() => `${themeId.value}-${mode.value}`);

onMounted(() => feed.start());
onBeforeUnmount(() => feed.dispose());

watchEffect(() =>
  feed.setTicksPerSecond(
    reducedMotion.value
      ? Math.min(ticksPerSecond.value, REDUCED_MOTION_TICK_CAP)
      : ticksPerSecond.value,
  ),
);

// pause when the tab is hidden or the hero is scrolled away
watchEffect(() => feed.setRunning(running.value && !!rows.value));

watchEffect(() => feed.attach(apis.value?.dataSourceApi ?? null));

// (re)build rows when the row count changes; ticks are held meanwhile
watch(
  rowCount,
  (count, _previous, onCleanup) => {
    const controller = new AbortController();
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      feed.hold(false);
    };
    onCleanup(() => {
      controller.abort();
      release();
    });
    feed.hold(true);
    const label = `building ${formatInt(count)} rows…`;
    if (count > BUILD_MESSAGE_THRESHOLD) building.value = label;
    void feed
      .buildRows(count, {
        signal: controller.signal,
        onProgress: (p) => {
          if (count > BUILD_MESSAGE_THRESHOLD && p < 1)
            building.value = `${label} ${Math.round(p * 100)}%`;
        },
      })
      .then((built) => {
        if (!built || controller.signal.aborted) return;
        feed.setRowCount(count);
        rows.value = built;
        building.value = null;
        if (selectedId.value < 0 || selectedId.value >= count) {
          selectedId.value = feed.topInstruments(1)[0]?.id ?? 0;
        }
        // let the DataSource load the new array before ticks are committed again
        requestAnimationFrame(() => requestAnimationFrame(release));
      });
  },
  { immediate: true },
);

watch(selectedId, (id) => {
  if (id >= 0) feed.select(id);
});

// tell the page that embeds the hero it is live, once the first rows painted
const stopAnnouncing = watchEffect(() => {
  if (!rows.value || !apis.value) return;
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'hero-live' }, location.origin);
      }
    }),
  );
  queueMicrotask(() => stopAnnouncing());
});

const setView = (next: HeroView) => {
  pivot.value = next === 'pivot';
  groupBy.value = next === 'flat' ? NO_GROUPS : GROUP_BY_SECTOR;
};

const onGroupByChange = (next: DataSourceGroupBy<Instrument>[]) => {
  groupBy.value = next;
  if (!next.length) pivot.value = false;
};

// ---- the scripted show: it clicks the real UI, with these as fallbacks ----
const controller: HeroController = {
  feed,
  getApis: () => apis.value,
  getState: () => ({
    rowCount: rowCount.value,
    themeId: themeId.value,
    view: view.value,
    building: building.value,
    rows: rows.value,
    densityId: densityId.value,
  }),
  setView,
  setRowCount: (count) => (rowCount.value = count),
  setThemeId: (id) => (themeId.value = id),
  setDensityId: (id) => (densityId.value = getHeroDensity(id).id),
  setTicksPerSecond: (rate) => (ticksPerSecond.value = rate),
  select: (id) => (selectedId.value = id),
};

const runShow = (context: ShowcaseScriptContext) =>
  runHeroScript({ ...context, hero: controller });
const resetShow = (context: ShowcaseScriptContext) =>
  resetHeroState({ ...context, hero: controller });
</script>

<template>
  <AutomatedDemo
    class="hero-auto hero-auto--page hero-frame"
    :ready="autoplay && !!rows && !!apis"
    waitForSelector=".InfiniteColumnCell"
    :run="runShow"
    :reset="resetShow"
  >
    <div
      ref="root"
      class="hero"
      :class="[themeClassName(themeId, mode), density.className]"
      :data-hero-mode="mode"
    >
      <ControlBar
        :themeId="themeId"
        :densityId="densityId"
        :ticksPerSecond="ticksPerSecond"
        :reducedMotion="reducedMotion"
        @themeChange="themeId = $event"
        @densityChange="densityId = $event"
        @ticksPerSecondChange="ticksPerSecond = $event"
      />
      <div class="hero-body">
        <div class="hero-main">
          <DataControls
            :view="view"
            :rowCount="rowCount"
            :allowMillion="allowMillion"
            :dataMode="dataMode"
            @viewChange="setView"
            @rowCountChange="rowCount = $event"
            @dataModeChange="dataMode = $event"
          />
          <div class="hero-grid">
            <HeroGrid
              v-if="rows"
              :feed="feed"
              :rows="rows"
              :groupBy="groupBy"
              :pivot="pivot"
              :flashDuration="reducedMotion ? 1600 : 700"
              :selectedId="selectedId"
              @groupByChange="onGroupByChange"
              @select="selectedId = $event"
              @ready="apis = $event"
            />
            <div v-if="building" class="hero-grid__busy">{{ building }}</div>
          </div>
          <StatsStrip :feed="feed" :building="building" />
        </div>
        <aside
          class="hero-side"
          aria-label="Charts fed by the same live stream"
        >
          <PriceChart
            v-if="selectedId >= 0"
            :feed="feed"
            :selectedId="selectedId"
            :active="running"
            :themeKey="themeKey"
          />
          <SectorBars :feed="feed" :active="running && !!rows" />
          <Heatmap
            :feed="feed"
            :rowCount="rows?.length ?? 0"
            :active="running && !!rows"
            :themeKey="themeKey"
            @select="selectedId = $event"
          />
        </aside>
      </div>
    </div>
  </AutomatedDemo>
</template>

<style>
/*
 * This page is only the hero: it fills the iframe the home page gives it.
 * `hero-frame` gives the pills of the show the hero's tokens (hero-tokens.css).
 */
.hero-auto--page {
  flex: 1;
  min-height: 0;
  /* the scripted cursor goes above the grid's menus (z-index 10000000) */
  --showcase-z: 2147483600;
}
</style>

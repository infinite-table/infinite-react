<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue';
import {
  DataSource,
  InfiniteTable,
  type DataSourceApi,
  type DataSourceGroupBy,
  type DataSourcePivotBy,
  type InfiniteTableApi,
} from '@infinite-table/infinite-vue';

import type { HeroFeed } from '../../../src/components/hero/data/feed';
import type { Instrument } from '../../../src/components/hero/data/instruments';
import {
  GROUP_REDUCERS,
  PIVOT_REDUCERS,
  getColumnMenuItems,
  groupColumn,
  makeColumns,
} from './columns';

export type HeroGridApis = {
  api: InfiniteTableApi<Instrument>;
  dataSourceApi: DataSourceApi<Instrument>;
};

/**
 * The live blotter: one DataSource fed by the worker stream, rendered by one
 * InfiniteTable. Everything below is regular, documented Infinite Table API.
 */
const props = defineProps<{
  feed: HeroFeed;
  rows: Instrument[];
  groupBy: DataSourceGroupBy<Instrument>[];
  pivot: boolean;
  flashDuration: number;
  selectedId: number;
}>();

const emit = defineEmits<{
  groupByChange: [groupBy: DataSourceGroupBy<Instrument>[]];
  select: [id: number];
  ready: [apis: HeroGridApis];
}>();

const PIVOT_BY: DataSourcePivotBy<Instrument>[] = [{ field: 'assetClass' }];
// the generated group column ('group-by') goes first, then the ticker
const COLUMN_PINNING = { 'group-by': 'start', symbol: 'start' } as const;

/**
 * The id the Infinite Table DevTools extension lists this grid under. It also
 * names the grid's tracks in the Chrome DevTools profiler.
 */
const DEVTOOLS_DEBUG_ID = 'live-demo-vue';

// narrow screens start without the long Name column, so Price fits
const initialVisibility: Record<string, false> | undefined =
  window.innerWidth < 640 ? { name: false } : undefined;

const columns = computed(() =>
  makeColumns(props.feed, { flashDuration: props.flashDuration }),
);

let apis: HeroGridApis | null = null;
let stopWatchingScroll: (() => void) | null = null;

// keep the on-screen rows ticking briskly (see feed.ts - "visible-row subscription")
onMounted(() => {
  props.feed.setFocusProvider(() => {
    if (!apis || apis.api.isDestroyed()) return [];
    const range = apis.api.getVisibleRenderRange();
    const ids: number[] = [];
    for (
      let index = range.start[0];
      index < range.end[0] && ids.length < 200;
      index++
    ) {
      const rowInfo = apis.dataSourceApi.getRowInfoByIndex(index);
      if (rowInfo && !rowInfo.isGroupRow && rowInfo.data)
        ids.push((rowInfo.data as Instrument).id);
    }
    return ids;
  });
});

onBeforeUnmount(() => {
  props.feed.setFocusProvider(null);
  stopWatchingScroll?.();
});

// big row counts: commits wait while the grid is being scrolled
const watchScroll = (api: InfiniteTableApi<Instrument>) => {
  stopWatchingScroll?.();
  const scroller = api.scrollContainer;
  if (!scroller) return;
  const onScroll = () => props.feed.noteScroll();
  scroller.addEventListener('scroll', onScroll, { passive: true });
  stopWatchingScroll = () => scroller.removeEventListener('scroll', onScroll);
};

const onReady = (ready: HeroGridApis) => {
  apis = ready;
  watchScroll(ready.api);
  emit('ready', ready);
};

const onRowSelectionChange = (id: unknown) => {
  if (typeof id === 'number') emit('select', id);
};

const onGroupByChange = (groupBy: DataSourceGroupBy<Instrument>[]) =>
  emit('groupByChange', groupBy);
</script>

<template>
  <DataSource
    primaryKey="id"
    :data="rows"
    :groupBy="groupBy"
    :onGroupByChange="onGroupByChange"
    :pivotBy="pivot ? PIVOT_BY : undefined"
    :aggregationReducers="pivot ? PIVOT_REDUCERS : GROUP_REDUCERS"
    selectionMode="single-row"
    :rowSelection="selectedId"
    :onRowSelectionChange="onRowSelectionChange"
  >
    <template #default="{ pivotColumns, pivotColumnGroups }">
      <InfiniteTable
        :debugId="DEVTOOLS_DEBUG_ID"
        :columns="columns"
        :pivotColumns="pivotColumns"
        :pivotColumnGroups="pivotColumnGroups"
        pivotTotalColumnPosition="end"
        :groupColumn="groupColumn"
        :getColumnMenuItems="getColumnMenuItems"
        groupRenderStrategy="single-column"
        :defaultColumnPinning="COLUMN_PINNING"
        :defaultColumnVisibility="initialVisibility"
        :columnDefaultWidth="110"
        keyboardNavigation="row"
        :onReady="onReady"
      />
    </template>
  </DataSource>
</template>

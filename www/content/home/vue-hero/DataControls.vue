<script setup lang="ts">
import { computed } from 'vue';

import { formatCompact } from '../../../src/components/hero/format';
import {
  ROW_COUNTS,
  type HeroDataMode,
  type HeroView,
} from '../../../src/components/hero/heroTypes';
import Segmented, { type SegmentOption } from './Segmented.vue';

/** The toolbar above the grid: what the grid shows and where data comes from. */
const props = defineProps<{
  view: HeroView;
  rowCount: number;
  allowMillion: boolean;
  dataMode: HeroDataMode;
}>();

const emit = defineEmits<{
  viewChange: [view: HeroView];
  rowCountChange: [count: number];
  dataModeChange: [mode: HeroDataMode];
}>();

const viewOptions: SegmentOption<HeroView>[] = [
  { value: 'flat', label: 'Flat' },
  { value: 'grouped', label: 'By sector' },
  { value: 'pivot', label: 'Pivot' },
];

const rowOptions = computed<SegmentOption<number>[]>(() =>
  ROW_COUNTS.filter((count) => props.allowMillion || count < 1_000_000).map(
    (count) => ({ value: count, label: formatCompact(count) }),
  ),
);

const dataOptions: SegmentOption<HeroDataMode>[] = [
  {
    value: 'client',
    label: 'Client · worker',
    title: 'Ticks simulated in a Web Worker, all rows in the browser',
  },
  {
    value: 'server',
    label: 'Server',
    title: 'Server-side data — coming soon',
    disabled: true,
  },
];
</script>

<template>
  <div class="hero-toolbar">
    <Segmented
      label="View"
      hookName="view"
      :value="view"
      :options="viewOptions"
      @change="emit('viewChange', $event)"
    />
    <Segmented
      label="Rows"
      hookName="rows"
      :value="rowCount"
      :options="rowOptions"
      @change="emit('rowCountChange', $event)"
    />
    <Segmented
      label="Data"
      hookName="data"
      :value="dataMode"
      :options="dataOptions"
      @change="emit('dataModeChange', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';

import {
  readPalette,
  type ChartPalette,
} from '../../../src/components/hero/charts/canvasUtils';
import {
  EMPTY_HEATMAP,
  drawHeatmap,
  hitTestHeatmap,
  layoutHeatmap,
} from '../../../src/components/hero/charts/heatmapLayout';
import type { HeroFeed } from '../../../src/components/hero/data/feed';
import { useCanvasSize, useFrameLoop } from './composables';

/**
 * Market heatmap: the biggest instruments, grouped by sector, sized by market
 * cap and colored by change % on a diverging scale (gray = flat). Click a tile
 * to chart it.
 */
const props = defineProps<{
  feed: HeroFeed;
  rowCount: number;
  active: boolean;
  /** Changes when the theme does, so colors are re-read. */
  themeKey: string;
}>();

const emit = defineEmits<{ select: [id: number] }>();

const canvas = ref<HTMLCanvasElement | null>(null);
const tooltip = ref<HTMLElement | null>(null);
const size = useCanvasSize(canvas);

// read on every draw, so not reactive
let hover = -1;
let palette: ChartPalette | null = null;

const laid = computed(() => {
  // the feed's top instruments change with the row count
  const tiles = props.rowCount ? props.feed.topInstruments(42) : [];
  return size.value.width
    ? layoutHeatmap(tiles, size.value.width, size.value.height)
    : EMPTY_HEATMAP;
});

const draw = () =>
  drawHeatmap(props.feed, laid.value, {
    canvas: canvas.value,
    size: size.value,
    palette,
    hover,
    tooltip: tooltip.value,
  });

const readColors = () => {
  if (canvas.value) palette = readPalette(canvas.value);
  draw();
};

onMounted(readColors);
// the theme's classes land on the hero in the same flush: read after it
watch(
  () => props.themeKey,
  () => nextTick(readColors),
);
watch(laid, draw);

useFrameLoop(() => props.active, draw, 5);

const onPointerMove = (event: PointerEvent) => {
  const index = hitTestHeatmap(laid.value, event);
  if (index !== hover) {
    hover = index;
    draw();
  }
};

const onPointerLeave = () => {
  hover = -1;
  draw();
};

const onClick = (event: MouseEvent) => {
  const tile = laid.value.rects[hitTestHeatmap(laid.value, event)];
  if (tile) emit('select', tile.id);
};
</script>

<template>
  <section class="hero-card hero-heatmap" aria-label="Market heatmap by sector">
    <header class="hero-card__header">
      <span class="hero-card__title">Market heatmap</span>
      <span class="hero-heatmap__legend" aria-hidden="true">
        <span class="hero-num">−2.5%</span>
        <span class="hero-heatmap__scale" />
        <span class="hero-num">+2.5%</span>
      </span>
    </header>
    <div class="hero-heatmap__plot">
      <canvas
        ref="canvas"
        class="hero-canvas"
        style="cursor: pointer"
        @pointermove="onPointerMove"
        @pointerleave="onPointerLeave"
        @click="onClick"
      />
      <div ref="tooltip" class="hero-tooltip" aria-hidden="true" />
    </div>
  </section>
</template>

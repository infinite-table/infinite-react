<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';

import {
  readPalette,
  type ChartPalette,
} from '../../../src/components/hero/charts/canvasUtils';
import { drawPriceChart } from '../../../src/components/hero/charts/drawPriceChart';
import type { HeroFeed } from '../../../src/components/hero/data/feed';
import { makeInstrument } from '../../../src/components/hero/data/instruments';
import { useCanvasSize, useFrameLoop } from './composables';

/**
 * Live price line for the selected row: one minute of 200ms samples that
 * scrolls smoothly, the open as a dashed reference, crosshair on hover.
 */
const props = defineProps<{
  feed: HeroFeed;
  selectedId: number;
  active: boolean;
  /** Changes when the theme does, so colors are re-read. */
  themeKey: string;
}>();

const canvas = ref<HTMLCanvasElement | null>(null);
const price = ref<HTMLElement | null>(null);
const change = ref<HTMLElement | null>(null);
const tooltip = ref<HTMLElement | null>(null);
const size = useCanvasSize(canvas);

// read every frame, so not reactive
let hover: number | null = null;
let palette: ChartPalette | null = null;

const info = computed(() =>
  makeInstrument(props.selectedId, { price: 0, volume: 0 }),
);

const draw = (now: number) =>
  drawPriceChart(
    props.feed,
    {
      canvas: canvas.value,
      size: size.value,
      palette,
      hover,
      tooltip: tooltip.value,
      price: price.value,
      change: change.value,
    },
    now,
  );

const readColors = () => {
  if (canvas.value) palette = readPalette(canvas.value);
};

onMounted(readColors);
// the theme's classes land on the hero in the same flush: read after it
watch(
  () => props.themeKey,
  () => nextTick(readColors),
);

useFrameLoop(() => props.active, draw, 60);
// draw once when paused, so it never shows blank
watch(
  [() => props.active, () => props.selectedId, () => props.themeKey, size],
  () =>
    nextTick(() => {
      if (!props.active) draw(performance.now());
    }),
);

const onPointerMove = (event: PointerEvent) => {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  hover = event.clientX - rect.left;
};
</script>

<template>
  <section
    class="hero-card hero-price"
    :aria-label="`Live price of ${info.symbol}`"
  >
    <header class="hero-card__header">
      <div class="hero-price__title">
        <span class="hero-card__title">{{ info.symbol }}</span>
        <span class="hero-card__subtitle">{{ info.name }}</span>
      </div>
      <div class="hero-price__quote">
        <span ref="price" class="hero-price__last hero-num" />
        <span ref="change" class="hero-price__change hero-num" />
      </div>
    </header>
    <div class="hero-price__plot">
      <canvas
        ref="canvas"
        class="hero-canvas"
        @pointermove="onPointerMove"
        @pointerleave="hover = null"
      />
      <div ref="tooltip" class="hero-tooltip" aria-hidden="true" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue';

import type { HeroFeed } from '../../../src/components/hero/data/feed';
import { SECTORS } from '../../../src/components/hero/data/instruments';
import { formatMoney } from '../../../src/components/hero/format';

const ROW = 19;

/**
 * Day P&L per sector, as diverging bars around a zero baseline. Bars re-rank
 * live; rows glide to their new position (CSS transforms), so a reorder reads
 * as movement rather than a jump.
 */
const props = defineProps<{ feed: HeroFeed; active: boolean }>();

const read = () => Array.from(props.feed.sectorDayPnl);
const rankOf = (current: number[]) =>
  current.map((_, k) => k).sort((a, b) => current[b] - current[a]);

const values = shallowRef<number[]>(read());
// bars update ~3×/s, but the ranking only every few seconds: constant
// reshuffling would read as noise, an occasional glide reads as news
const order = shallowRef<number[]>(rankOf(values.value));
const hover = ref<number | null>(null);

let valuesTimer = 0;
let orderTimer = 0;
const stop = () => {
  window.clearInterval(valuesTimer);
  window.clearInterval(orderTimer);
};

watch(
  () => props.active,
  (active) => {
    stop();
    values.value = read();
    order.value = rankOf(values.value);
    if (!active) return;
    valuesTimer = window.setInterval(() => (values.value = read()), 350);
    orderTimer = window.setInterval(
      () => (order.value = rankOf(values.value)),
      2600,
    );
  },
  { immediate: true },
);
onBeforeUnmount(stop);

const rank = computed(() => {
  const result = new Array<number>(values.value.length);
  order.value.forEach((k, index) => (result[k] = index));
  return result;
});
const maxAbs = computed(() => Math.max(1, ...values.value.map(Math.abs)));
const total = computed(() => values.value.reduce((acc, v) => acc + v, 0));

const bars = computed(() =>
  SECTORS.map((sector, k) => {
    const value = values.value[k];
    const width = (Math.abs(value) / maxAbs.value) * 50;
    const up = value >= 0;
    return {
      sector,
      value,
      up,
      rowStyle: { transform: `translateY(${rank.value[k] * ROW}px)` },
      barStyle: {
        left: up ? '50%' : `${50 - width}%`,
        width: `${Math.max(0.6, width)}%`,
      },
    };
  }),
);
</script>

<template>
  <section class="hero-card hero-sectors" aria-label="Day P&L by sector">
    <header class="hero-card__header">
      <span class="hero-card__title">Day P&amp;L by sector</span>
      <span
        class="hero-card__value hero-money"
        :class="`hero-money--${total >= 0 ? 'up' : 'down'}`"
      >
        {{ formatMoney(total) }}
      </span>
    </header>
    <div
      class="hero-sectors__rows"
      :style="{ height: `${values.length * ROW}px` }"
    >
      <span class="hero-sectors__zero" aria-hidden="true" />
      <div
        v-for="(bar, k) in bars"
        :key="bar.sector"
        class="hero-sectors__row"
        :data-hover="hover === k ? 'true' : undefined"
        :style="bar.rowStyle"
        :title="`${bar.sector}: ${formatMoney(bar.value)}`"
        @pointerenter="hover = k"
        @pointerleave="hover = null"
      >
        <span class="hero-sectors__label">{{ bar.sector }}</span>
        <span class="hero-sectors__track">
          <span
            class="hero-sectors__bar"
            :class="`hero-sectors__bar--${bar.up ? 'up' : 'down'}`"
            :style="bar.barStyle"
          />
        </span>
        <span class="hero-sectors__value hero-num">
          {{ formatMoney(bar.value) }}
        </span>
      </div>
    </div>
  </section>
</template>

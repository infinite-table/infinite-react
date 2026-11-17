<script setup lang="ts">
import { computed } from 'vue';

import { formatCompact, formatInt } from '../../../src/components/hero/format';
import { TICK_RATES } from '../../../src/components/hero/heroTypes';
import {
  HERO_DENSITIES,
  HERO_THEMES,
  type HeroDensity,
} from '../../../src/components/hero/themes';
import Segmented from './Segmented.vue';

/** The top bar: how the grid looks and how fast the feed ticks. */
const props = defineProps<{
  themeId: string;
  densityId: HeroDensity['id'];
  ticksPerSecond: number;
  reducedMotion: boolean;
}>();

const emit = defineEmits<{
  themeChange: [id: string];
  densityChange: [id: HeroDensity['id']];
  ticksPerSecondChange: [rate: number];
}>();

const themeOptions = HERO_THEMES.map((theme) => ({
  value: theme.id,
  label: theme.label,
  swatch: theme.swatch,
}));
const densityOptions = HERO_DENSITIES.map((density) => ({
  value: density.id,
  label: density.label,
}));

const rateIndex = computed(() =>
  Math.max(
    0,
    TICK_RATES.findIndex((rate) => rate >= props.ticksPerSecond),
  ),
);

const onRateInput = (event: Event) =>
  emit(
    'ticksPerSecondChange',
    TICK_RATES[Number((event.target as HTMLInputElement).value)],
  );
</script>

<template>
  <div class="hero-controls">
    <Segmented
      label="Theme"
      hookName="theme"
      :value="themeId"
      :options="themeOptions"
      @change="emit('themeChange', $event)"
    />
    <Segmented
      label="Density"
      hookName="density"
      :value="densityId"
      :options="densityOptions"
      @change="emit('densityChange', $event)"
    />
    <div class="hero-control">
      <label class="hero-control__label" for="hero-tick-rate">Tick rate</label>
      <div class="hero-rate">
        <input
          id="hero-tick-rate"
          type="range"
          min="0"
          :max="TICK_RATES.length - 1"
          step="1"
          :value="rateIndex"
          data-hero-rate
          :aria-valuetext="`${formatInt(
            TICK_RATES[rateIndex],
          )} ticks per second`"
          @input="onRateInput"
        />
        <span class="hero-rate__value hero-num">
          {{ formatCompact(TICK_RATES[rateIndex]) }}/s
          <span v-if="reducedMotion" class="hero-dim"> (reduced motion)</span>
        </span>
      </div>
    </div>
  </div>
</template>

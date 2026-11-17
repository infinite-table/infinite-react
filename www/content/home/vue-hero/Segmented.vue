<script setup lang="ts" generic="V extends string | number">
export type SegmentOption<V extends string | number> = {
  value: V;
  label: string;
  /** A color dot before the label. */
  swatch?: string;
  title?: string;
  disabled?: boolean;
};

defineProps<{
  label: string;
  value: V;
  options: SegmentOption<V>[];
  /** The scripted show finds a button by its `data-hero-<hookName>` value. */
  hookName: string;
}>();

const emit = defineEmits<{ change: [value: V] }>();
</script>

<template>
  <div class="hero-control" role="group" :aria-label="label">
    <span class="hero-control__label">{{ label }}</span>
    <div class="hero-segmented">
      <button
        v-for="option in options"
        :key="String(option.value)"
        type="button"
        class="hero-segmented__item"
        :aria-pressed="option.value === value"
        :disabled="option.disabled"
        :title="option.title"
        v-bind="{ [`data-hero-${hookName}`]: String(option.value) }"
        @click="emit('change', option.value)"
      >
        <span
          v-if="option.swatch"
          class="hero-swatch"
          :style="{ background: option.swatch }"
          aria-hidden="true"
        />
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

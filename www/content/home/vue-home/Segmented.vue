<script setup lang="ts" generic="T extends string">
/** The Vue port of `Segmented` (src/components/home/demos/shared.tsx). */
defineProps<{
  label: string;
  options: readonly { id: T; label: string }[];
  value: T;
}>();

const emit = defineEmits<{ change: [value: T] }>();
</script>

<template>
  <div class="home-demo__group">
    <span class="home-demo__label">{{ label }}</span>
    <div class="home-seg" role="group" :aria-label="label">
      <button
        v-for="option in options"
        :key="option.id"
        type="button"
        :aria-pressed="option.id === value"
        @click="emit('change', option.id)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

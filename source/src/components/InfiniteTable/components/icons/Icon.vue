<template>
  <svg
    viewBox="0 0 24 24"
    v-bind="$attrs"
    :style="computedStyle"
  >
    <slot />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface TableIconProps {
  size?: number | string;
  style?: Record<string, any>;
  className?: string;
}

interface Props extends TableIconProps {}

const props = withDefaults(defineProps<Props>(), {
  size: 'var(--infinite-icon-size)',
  style: () => ({})
});

const computedStyle = computed(() => ({
  flex: 'none',
  width: props.size,
  height: props.size,
  fill: 'currentColor',
  ...props.style,
}));
</script>
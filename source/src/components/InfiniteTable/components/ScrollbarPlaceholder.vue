<template>
  <div v-if="variant === 'horizontal' && scrollbarWidth">
    <div
      data-name="horizontal-scrollbar-placeholder"
      :style="{
        position: 'absolute',
        overflow: 'visible',
        overflowX: 'scroll',
        bottom: 0,
        ...style
      }"
    />
  </div>
  <div v-else-if="variant === 'vertical' && scrollbarWidth">
    <div
      data-name="vertical-scrollbar-placeholder"
      :style="{
        position: 'absolute',
        overflow: 'visible',
        overflowY: 'scroll',
        bottom: 0,
        ...style
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getScrollbarWidth } from '../../utils/getScrollbarWidth';

interface Props {
  variant: 'horizontal' | 'vertical';
  style?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  style: () => ({})
});

// Use the shared utility function
const scrollbarWidth = computed(() => getScrollbarWidth());
</script>
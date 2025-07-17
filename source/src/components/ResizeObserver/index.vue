<template>
  <div ref="elementRef" :style="style"></div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Size, OnResizeFn } from '../types/Size';
import { useResizeObserver } from './useResizeObserver.vue';

interface ResizeObserverProps {
  /**
   * Specifies whether to call onResize after the initial render (on mount)
   *
   * @default true
   */
  notifyOnMount?: boolean;

  /**
   * If set to true, it will be attached using immediate watch. If false, will be attached on mount
   * @default false
   */
  earlyAttach?: boolean;

  debounce?: number;
}

interface Props extends ResizeObserverProps {}

const props = withDefaults(defineProps<Props>(), {
  notifyOnMount: true,
  earlyAttach: false,
  debounce: 0
});

const emit = defineEmits<{
  resize: [size: Size];
}>();

const elementRef = ref<HTMLDivElement>();
const firstTime = ref(true);

const style = computed(() => ({
  position: 'absolute' as const,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  boxSizing: 'border-box' as const,
}));

const onResize = (size: Size) => {
  if (firstTime.value && !props.notifyOnMount) {
    firstTime.value = false;
    return;
  }
  firstTime.value = false;
  emit('resize', size);
};

useResizeObserver(elementRef, onResize, { 
  earlyAttach: props.earlyAttach,
  debounce: props.debounce
});
</script>
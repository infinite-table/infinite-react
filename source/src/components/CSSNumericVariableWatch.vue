<template>
  <div
    data-name="css-variable-watcher"
    :data-var="varName"
    :style="WRAPPER_STYLE"
  >
    <div
      ref="elementRef"
      :style="{
        height: allowInts ? `calc(1px * ${height})` : height
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useResizeObserver } from './ResizeObserver/useResizeObserver.vue';
import { dbg, err } from '../utils/debugLoggers';

const error = err('CSSVariableWatch');
const debug = dbg('CSSVariableWatch');

interface CSSVariableWatcherProps {
  varName: string;
  allowInts?: boolean;
}

interface Props extends CSSVariableWatcherProps {}

const props = withDefaults(defineProps<Props>(), {
  allowInts: false
});

const emit = defineEmits<{
  change: [value: number];
}>();

const elementRef = ref<HTMLDivElement>();
const lastValue = ref<number>(0);

const WRAPPER_STYLE = {
  position: 'absolute' as const,
  pointerEvents: 'none' as const,
  width: 0,
  height: 0,
  lineHeight: 0,
  fontSize: 0,
  overflow: 'hidden' as const,
};

const height = computed(() => 
  props.varName.startsWith('var(')
    ? props.varName
    : `var(${props.varName})`
);

const onResize = ({ height }: { height: number }) => {
  if (height != null && height !== lastValue.value) {
    lastValue.value = height;
    emit('change', height);
  }
};

// Use the Vue ResizeObserver composable
useResizeObserver(elementRef, onResize, { earlyAttach: true });

// Initialize on mount
onMounted(() => {
  if (elementRef.value) {
    const value = elementRef.value.getBoundingClientRect().height;

    if (value) {
      lastValue.value = value;
      debug(`Variable ${props.varName} found and equals ${value}.`);
      emit('change', value);
    } else {
      error(
        `Specified variable ${props.varName} not found or does not have a numeric value.`,
      );
    }
  }
});
</script>
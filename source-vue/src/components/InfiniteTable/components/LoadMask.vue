<template>
  <div :class="`${LoadMaskCls[visible ? 'visible' : 'hidden']} ${baseCls}`">
    <div :class="`${LoadMaskOverlayCls} ${baseCls}-Overlay`"></div>
    <div :class="`${LoadMaskTextCls} ${baseCls}-Text`">
      <slot>{{ children || 'Loading' }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  LoadMaskCls,
  LoadMaskOverlayCls,
  LoadMaskTextCls,
} from './LoadMask.css';
import { internalProps } from '../internalProps';
import { LoadMaskProps } from '../types/InfiniteTableProps';

interface Props extends LoadMaskProps {
  visible: boolean;
  children?: string;
}

const props = withDefaults(defineProps<Props>(), {
  children: 'Loading',
});

const { rootClassName } = internalProps;
const baseCls = computed(() => `${rootClassName}-LoadMask`);
</script>
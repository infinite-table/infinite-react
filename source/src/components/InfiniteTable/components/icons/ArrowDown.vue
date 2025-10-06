<template>
  <Icon v-bind="props">
    <path
      fill="currentColor"
      d="M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z"
    />
  </Icon>
</template>

<script setup lang="ts">
import Icon from './Icon.vue';
import type { TableIconProps } from './Icon.vue';

interface Props extends Omit<TableIconProps, 'children'> {}

const props = defineProps<Props>();
</script>
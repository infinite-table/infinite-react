<template>
  <Icon v-bind="props">
    <path
      fill="currentColor"
      d="M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z"
    />
  </Icon>
</template>

<script setup lang="ts">
import Icon from './Icon.vue';
import type { TableIconProps } from './Icon.vue';

interface Props extends Omit<TableIconProps, 'children'> {}

const props = defineProps<Props>();
</script>
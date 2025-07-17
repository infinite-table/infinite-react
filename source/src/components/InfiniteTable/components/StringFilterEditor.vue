<template>
  <input
    data-xxx
    :aria-label="ariaLabel"
    type="text"
    :disabled="disabled"
    :value="value as string"
    @input="handleChange"
    :class="className"
  />
</template>

<script setup lang="ts">
import { useInfiniteColumnFilterEditor } from './InfiniteTableHeader/useInfiniteColumnFilterEditor.vue';

const { ariaLabel, value, setValue, className, disabled } = 
  useInfiniteColumnFilterEditor<string>();

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  setValue(target.value);
};
</script>
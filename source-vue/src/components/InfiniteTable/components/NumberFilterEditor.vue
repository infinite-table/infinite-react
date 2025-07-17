<template>
  <input
    :aria-label="ariaLabel"
    type="number"
    data-yyy
    :disabled="disabled"
    :value="(value as number) ?? ''"
    @input="handleChange"
    :class="className"
  />
</template>

<script setup lang="ts">
import { useInfiniteColumnFilterEditor } from './InfiniteTableHeader/useInfiniteColumnFilterEditor';

const { ariaLabel, value, setValue, className, disabled } = 
  useInfiniteColumnFilterEditor<number>();

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  let newValue = isNaN(target.valueAsNumber)
    ? target.value as any
    : target.valueAsNumber;
  setValue(newValue);
};
</script>
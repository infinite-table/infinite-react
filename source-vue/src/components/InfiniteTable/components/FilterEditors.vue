<template>
  <!-- String Filter Editor -->
  <input
    v-if="type === 'string'"
    data-xxx
    :aria-label="ariaLabel"
    type="text"
    :disabled="disabled"
    :value="value as string"
    @input="handleStringChange"
    :class="className"
  />
  
  <!-- Number Filter Editor -->
  <input
    v-else-if="type === 'number'"
    :aria-label="ariaLabel"
    type="number"
    data-yyy
    :disabled="disabled"
    :value="(value as number) ?? ''"
    @input="handleNumberChange"
    :class="className"
  />
</template>

<script setup lang="ts">
import { useInfiniteColumnFilterEditor } from './InfiniteTableHeader/useInfiniteColumnFilterEditor';

interface Props {
  type: 'string' | 'number';
}

const props = defineProps<Props>();

const { ariaLabel, value, setValue, className, disabled } = 
  useInfiniteColumnFilterEditor<any>();

const handleStringChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  setValue(target.value);
};

const handleNumberChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  let newValue = isNaN(target.valueAsNumber)
    ? target.value
    : target.valueAsNumber;
  setValue(newValue);
};
</script>
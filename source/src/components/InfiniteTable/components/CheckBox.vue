<template>
  <input
    v-bind="domProps"
    :class="inputClass"
    type="checkbox"
    ref="inputRef"
    :checked="!!checked"
    :disabled="disabled"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { join } from '../../../utils/join';
import { CheckBoxCls } from './CheckBox.css';
import type { InfiniteCheckBoxProps, InfiniteCheckBoxPropChecked } from './CheckBox';

interface Props extends InfiniteCheckBoxProps {}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  checked: null,
  domProps: () => ({})
});

const emit = defineEmits<{
  change: [checked: InfiniteCheckBoxPropChecked];
}>();

const inputRef = ref<HTMLInputElement>();

// Computed class for the input
const inputClass = computed(() => 
  join('InfiniteCheckBox', CheckBoxCls, props.domProps?.className)
);

// Handle checkbox state changes
const handleChange = () => {
  if (props.disabled) {
    return;
  }
  const newChecked = !props.checked;
  emit('change', newChecked);
};

// Watch for checked state changes to handle indeterminate
watch(() => props.checked, (checked) => {
  if (inputRef.value) {
    inputRef.value.indeterminate = checked == null;
  }
}, { immediate: true });
</script>
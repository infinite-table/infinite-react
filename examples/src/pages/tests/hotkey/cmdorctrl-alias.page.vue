<script setup lang="ts">
import { onMounted } from 'vue';

import {
  eventToKeyDescriptor,
  keyboardShortcutBinding,
} from '@src/components/utils/hotkey';

(globalThis as any).combinations = {};

const fn = (e: KeyboardEvent) => {
  const key = eventToKeyDescriptor(e as any);
  console.log(e.key);
  (globalThis as any).combinations[key] =
    (globalThis as any).combinations[key] || 0;
  (globalThis as any).combinations[key]++;
};

onMounted(() => {
  const callback = keyboardShortcutBinding(
    ['cmd|ctrl+g', 'ctrl|cmd+shift+enter', 'ctrl|cmd+shift+i'],
    fn,
  );
  //@ts-ignore
  document.documentElement.addEventListener('keydown', callback);
});
</script>

<template>
  <input type="text" value="x" />
</template>

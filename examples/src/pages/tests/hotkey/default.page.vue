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
    [
      'ctrl+shift+i',
      'a',
      'b',
      'c',
      'd',
      'cmd+t',
      'cmd+e',
      'alt+shift+x',
      'shift+alt+y',
      'alt+*',
      'alt+shift+*',
      'escape',
      '*',
    ],
    fn,
  );
  //@ts-ignore
  document.documentElement.addEventListener('keydown', callback);
});
</script>

<template>
  <input type="text" value="x" />
</template>

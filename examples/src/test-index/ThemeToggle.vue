<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

import {
  type ExamplesTheme,
  onThemeChange,
  readTheme,
  themeToggleLabel,
  themeToggleTitle,
  toggleTheme,
} from './examplesTheme';

// the light / dark toggle of the bottom right bar (examplesTheme.ts)
const theme = ref<ExamplesTheme | null>(null);
let dispose: (() => void) | null = null;

onMounted(() => {
  if ((navigator as any).webdriver) return;
  theme.value = readTheme();
  dispose = onThemeChange((value) => {
    theme.value = value;
  });
});

onBeforeUnmount(() => dispose?.());
</script>

<template>
  <button
    v-if="theme"
    type="button"
    class="ex-chrome-item ex-chrome-icon"
    :title="themeToggleTitle(theme)"
    :aria-label="themeToggleTitle(theme)"
    @click="toggleTheme"
  >
    {{ themeToggleLabel(theme) }}
  </button>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import TestPagesIndex from './TestPagesIndex.vue';
import type { TestPagesIndexProps } from './TestPagesIndex.types';

const route = useRoute();
const props = ref<TestPagesIndexProps | null>(null);
const error = ref<string | null>(null);

const loadProps = async (relativePath: string) => {
  error.value = null;
  props.value = null;
  try {
    const response = await fetch(
      `/__test-index-props?path=${encodeURIComponent(relativePath)}`,
    );
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    props.value = (await response.json()) as TestPagesIndexProps;
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
};

onMounted(() => {
  void loadProps((route.meta.indexRelativePath as string) || '');
});

watch(
  () => route.meta.indexRelativePath,
  (relativePath) => {
    if (typeof relativePath === 'string') {
      void loadProps(relativePath);
    }
  },
);
</script>

<template>
  <TestPagesIndex v-if="props" v-bind="props" />
  <p v-else-if="error" class="error">Failed to load index: {{ error }}</p>
  <p v-else class="loading">Loading…</p>
</template>

<style scoped>
.loading,
.error {
  padding: 20px;
  color: rgba(255, 255, 255, 0.75);
  font-family: sans-serif;
}

.error {
  color: #fca5a5;
}
</style>

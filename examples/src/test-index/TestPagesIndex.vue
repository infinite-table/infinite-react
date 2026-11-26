<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

import type { TestPagesIndexProps } from './TestPagesIndex.types';
import { mountTestPagesIndex } from './testPagesIndexApp';
import { TEST_RUNNER_PORT } from './testRunnerShared';

// The test pages index of a folder: the framework-free index of
// testPagesIndexApp.ts, shared with the React and Angular apps.
const props = defineProps<TestPagesIndexProps>();

const el = ref<HTMLDivElement | null>(null);
let dispose: (() => void) | null = null;

onMounted(() => {
  if (!el.value) return;
  dispose = mountTestPagesIndex(el.value, {
    framework: 'vue',
    segments: props.segments,
    parentHref: props.parentHref,
    entries: props.entries,
    testRunnerPort: TEST_RUNNER_PORT,
  });
});

onBeforeUnmount(() => dispose?.());
</script>

<template>
  <div ref="el" />
</template>

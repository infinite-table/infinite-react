<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { useTestRunner } from './useTestRunner';
import TestRunnerOutputPanel from './TestRunnerOutputPanel.vue';

const props = withDefaults(
  defineProps<{
    embedded?: boolean;
  }>(),
  { embedded: false },
);

const route = useRoute();
const pathname = computed(() => route.path);
const runner = useTestRunner(() => pathname.value);

const tone = computed(() => {
  const status = runner.status.value;
  if (status === 'pass' || status === 'fail' || status === 'idle') return status;
  return 'running';
});

const buttonTitle = computed(() => {
  if (runner.active.value) {
    return runner.mode.value === 'folder'
      ? 'Stop watching this folder'
      : 'Stop watching this test';
  }
  return runner.mode.value === 'folder'
    ? 'Run all Playwright tests in this folder (watch mode)'
    : 'Run Playwright test for this page (watch mode)';
});
</script>

<template>
  <template v-if="runner.enabled.value && pathname">
    <button
      type="button"
      data-testid="infinite-page-run-test"
      class="ex-chrome-item ex-chrome-run"
      :class="`tone-${tone}`"
      :title="buttonTitle"
      @click="runner.active.value ? runner.stop() : runner.start(pathname)"
    >
      {{ runner.buttonLabel(pathname) }}
    </button>

    <TestRunnerOutputPanel
      v-if="runner.showOutput.value"
      :runner="runner"
      :pathname="pathname"
    />
  </template>
</template>

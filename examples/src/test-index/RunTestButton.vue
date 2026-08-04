<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { STATUS_COLORS } from './testRunnerShared';
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
      class="run-button"
      :class="{ embedded: props.embedded }"
      :title="buttonTitle"
      :style="{ background: STATUS_COLORS[runner.status.value] }"
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

<style scoped>
.run-button {
  padding: 4px 10px;
  font-size: 12px;
  line-height: 1.2;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  opacity: 0.9;
  min-width: 84px;
  font-family: inherit;
}

.run-button:not(.embedded) {
  position: fixed;
  bottom: 6px;
  right: 38px;
  z-index: 10000;
}
</style>

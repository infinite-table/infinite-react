<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';

import {
  labelFor,
  stripAnsi,
  type TestRunnerStatus,
} from './testRunnerShared';
import type { useTestRunner } from './useTestRunner';

const FILE_REF_RE =
  /((?:\/|\.{0,2}\/)?[\w@.\-/]+\.(?:tsx?|jsx?|mjs|cjs|vue)):(\d+)(?::(\d+))?/g;

const props = defineProps<{
  runner: ReturnType<typeof useTestRunner>;
  pathname: string | null;
}>();

const outputRef = ref<HTMLDivElement | null>(null);

watch(
  () => props.runner.output.value,
  async () => {
    await nextTick();
    const el = outputRef.value;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  },
);

type OutputPart =
  | { kind: 'text'; value: string }
  | { kind: 'link'; value: string; file: string; line: number; col?: number };

const outputParts = (raw: string): OutputPart[] => {
  const text = stripAnsi(raw);
  const parts: OutputPart[] = [];
  const re = new RegExp(FILE_REF_RE.source, 'g');
  let lastIdx = 0;
  while (true) {
    const match = re.exec(text);
    if (match === null) {
      break;
    }
    const [full, file, lineStr, colStr] = match;
    if (match.index > lastIdx) {
      parts.push({ kind: 'text', value: text.slice(lastIdx, match.index) });
    }
    parts.push({
      kind: 'link',
      value: full,
      file,
      line: Number(lineStr),
      col: colStr ? Number(colStr) : undefined,
    });
    lastIdx = match.index + full.length;
  }
  if (lastIdx < text.length) {
    parts.push({ kind: 'text', value: text.slice(lastIdx) });
  }
  return parts;
};

const onOpenClick = (
  event: MouseEvent,
  file: string,
  line: number,
  col?: number,
) => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey) {
    return;
  }
  event.preventDefault();
  props.runner.openInEditor(file, line, col);
};
</script>

<template>
  <div class="panel">
    <div class="panel-header">
      <span>
        playwright ·
        {{ labelFor(runner.status.value, runner.mode.value, runner.specCount.value) }}
        <span v-if="runner.active.value && runner.status.value !== 'running'">
          · watching
        </span>
        <span
          v-if="runner.openStatus.value.kind !== 'idle'"
          class="open-status"
          :class="`open-status--${runner.openStatus.value.kind}`"
        >
          ·
          <template v-if="runner.openStatus.value.kind === 'opening'">
            opening {{ runner.openStatus.value.file }}…
          </template>
          <template v-else-if="runner.openStatus.value.kind === 'ok'">
            opened {{ runner.openStatus.value.file }}
            <template v-if="runner.openStatus.value.editor">
              ({{ runner.openStatus.value.editor }})
            </template>
          </template>
          <template v-else>
            open failed: {{ runner.openStatus.value.error }}
          </template>
        </span>
      </span>
      <div class="panel-actions">
        <button type="button" class="panel-btn" title="Clear output" @click="runner.output.value = ''">
          clear
        </button>
        <button
          type="button"
          class="panel-btn panel-btn--icon"
          title="Re-run test"
          aria-label="Re-run test"
          @click="runner.rerun(pathname)"
        >
          ↻
        </button>
        <button
          type="button"
          class="panel-btn panel-btn--icon"
          title="Close panel"
          aria-label="Close panel"
          @click="runner.showOutput.value = false"
        >
          ×
        </button>
      </div>
    </div>
    <div ref="outputRef" class="panel-body">
      <template v-if="runner.output.value">
        <template
          v-for="(part, index) in outputParts(runner.output.value)"
          :key="index"
        >
          <a
            v-if="part.kind === 'link'"
            href="#"
            class="file-link"
            :title="`Open ${part.file}:${part.line}${part.col ? `:${part.col}` : ''} in editor`"
            @click="onOpenClick($event, part.file, part.line, part.col)"
          >
            {{ part.value }}
          </a>
          <template v-else>{{ part.value }}</template>
        </template>
      </template>
      <template v-else>
        {{ runner.active.value ? '(starting…)' : '(no output yet)' }}
      </template>
    </div>
  </div>
</template>

<style scoped>
.panel {
  position: fixed;
  bottom: 38px;
  right: 6px;
  width: 540px;
  max-width: calc(100vw - 24px);
  max-height: 50vh;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.9);
  color: #fff;
  font: 11px ui-monospace, SFMono-Regular, Menlo, monospace;
  border-radius: 4px;
  z-index: 10000;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.45);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  opacity: 0.85;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.panel-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  cursor: pointer;
  padding: 4px 8px;
  font: inherit;
  opacity: 0.8;
  border-radius: 4px;
}

.panel-btn--icon {
  width: 28px;
  height: 28px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.panel-body {
  padding: 8px;
  overflow: auto;
  white-space: pre-wrap;
  flex: 1;
}

.file-link {
  color: #7dd3fc;
  text-decoration: underline;
  cursor: pointer;
}

.open-status--ok {
  color: #86efac;
}

.open-status--err {
  color: #fca5a5;
}

.open-status--opening {
  color: #bfdbfe;
}
</style>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

import type { TestPagesIndexProps } from './TestPagesIndex.types';
import { useTestRunner } from './useTestRunner';
import TestRunnerOutputPanel from './TestRunnerOutputPanel.vue';

const props = defineProps<TestPagesIndexProps>();

const STORAGE_KEY = 'infinite-tests:index-search';

type TreeMeta = {
  isLast: boolean;
  ancestorHasNext: boolean[];
};

const query = ref('');
const inputRef = ref<HTMLInputElement | null>(null);
const runnerPathname = ref<string | null>(null);

const runner = useTestRunner(() => runnerPathname.value);

const title = computed(() =>
  props.segments.length === 0 ? 'Test pages (Vue)' : props.segments.join(' / '),
);

onMounted(() => {
  query.value = window.sessionStorage.getItem(STORAGE_KEY) ?? '';
});

watch(query, (value) => {
  window.sessionStorage.setItem(STORAGE_KEY, value);
});

const clearPersistedQuery = () => {
  window.sessionStorage.removeItem(STORAGE_KEY);
};

const onKeyDown = (event: KeyboardEvent) => {
  if (event.key !== '/') {
    return;
  }
  const active = document.activeElement;
  const isEditable =
    active instanceof HTMLInputElement ||
    active instanceof HTMLTextAreaElement ||
    (active instanceof HTMLElement && active.isContentEditable);
  if (isEditable) {
    return;
  }
  event.preventDefault();
  inputRef.value?.focus();
};

onMounted(() => window.addEventListener('keydown', onKeyDown));
onUnmounted(() => window.removeEventListener('keydown', onKeyDown));

const filtered = computed(() => {
  const trimmed = query.value.trim().toLowerCase();
  if (!trimmed) {
    return props.entries;
  }
  return props.entries.filter(
    (entry) =>
      entry.path.toLowerCase().includes(trimmed) ||
      entry.name.toLowerCase().includes(trimmed),
  );
});

const computeTreeMeta = (entries: typeof props.entries): TreeMeta[] =>
  entries.map((entry, index) => {
    const { depth } = entry;

    let isLast = true;
    for (let i = index + 1; i < entries.length; i++) {
      if (entries[i].depth <= depth) {
        isLast = entries[i].depth < depth;
        break;
      }
    }

    const ancestorHasNext: boolean[] = [];
    for (let level = 0; level < depth; level++) {
      let ancestorIdx = index;
      while (ancestorIdx >= 0 && entries[ancestorIdx].depth !== level) {
        ancestorIdx--;
      }

      let hasNextSibling = false;
      if (ancestorIdx >= 0) {
        for (let i = ancestorIdx + 1; i < entries.length; i++) {
          if (entries[i].depth === level) {
            hasNextSibling = true;
            break;
          }
          if (entries[i].depth < level) {
            break;
          }
        }
      }

      ancestorHasNext.push(hasNextSibling);
    }

    return { isLast, ancestorHasNext };
  });

const treeMeta = computed(() => computeTreeMeta(filtered.value));

const highlightParts = (text: string, q: string) => {
  if (!q) {
    return [{ text, match: false }];
  }
  const lower = text.toLowerCase();
  const target = q.toLowerCase();
  const idx = lower.indexOf(target);
  if (idx === -1) {
    return [{ text, match: false }];
  }
  return [
    { text: text.slice(0, idx), match: false },
    { text: text.slice(idx, idx + q.length), match: true },
    { text: text.slice(idx + q.length), match: false },
  ];
};

const runForHref = async (href: string, event: MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();
  runnerPathname.value = href;
  if (runner.active.value) {
    runner.stop();
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  void runner.start(href);
};
</script>

<template>
  <div class="test-pages-index">
    <template v-if="props.parentHref !== null">
      <a
        :href="props.parentHref"
        class="nav-link"
        @click="clearPersistedQuery"
      >
        ← Back
      </a>
      <a href="/tests" class="nav-link" @click="clearPersistedQuery">
        ← Tests
      </a>
    </template>

    <h1>{{ title }}</h1>

    <div v-if="props.entries.length > 0" class="toolbar">
      <input
        ref="inputRef"
        v-model="query"
        type="search"
        placeholder="Filter subtree… (press / to focus)"
        aria-label="Filter test pages in this folder and subfolders"
        class="search-input"
      />
      <span class="count">
        {{
          query.trim()
            ? `${filtered.length} / ${props.entries.length}`
            : `${props.entries.length} ${props.entries.length === 1 ? 'entry' : 'entries'}`
        }}
      </span>
    </div>

    <p v-if="props.entries.length === 0" class="muted">No test pages in this folder.</p>
    <p v-else-if="filtered.length === 0" class="muted">
      No matches for “{{ query.trim() }}”.
    </p>

    <ul v-else class="entries">
      <li
        v-for="(entry, index) in filtered"
        :key="`${entry.type}:${entry.href}`"
        class="entry"
      >
        <span class="guides" aria-hidden="true">
          <template v-if="entry.depth > 0">
            <span
              v-for="level in entry.depth"
              :key="level"
              class="guide-col"
            >
              <span
                v-if="level === entry.depth || treeMeta[index].ancestorHasNext[level - 1]"
                class="guide-vertical"
                :class="{
                  'guide-vertical--branch-last':
                    level === entry.depth && treeMeta[index].isLast,
                }"
              />
              <span
                v-if="level === entry.depth"
                class="guide-branch"
              />
            </span>
          </template>
        </span>

        <a
          :href="entry.href"
          class="entry-link"
          :style="{ paddingLeft: entry.depth === 0 ? '0' : '4px' }"
          @click="clearPersistedQuery"
        >
          <span v-if="entry.type === 'folder'">📁 </span>
          <template
            v-for="(part, partIndex) in highlightParts(entry.path, query.trim())"
            :key="partIndex"
          >
            <mark v-if="part.match" class="highlight">{{ part.text }}</mark>
            <template v-else>{{ part.text }}</template>
          </template>
          <span v-if="entry.type === 'folder'">/</span>
        </a>

        <button
          v-if="entry.type === 'page'"
          type="button"
          class="run-inline"
          title="Run Playwright test for this page (watch mode)"
          @click="runForHref(entry.href, $event)"
        >
          ▶ Run
        </button>
      </li>
    </ul>

    <TestRunnerOutputPanel
      v-if="runner.showOutput.value"
      :runner="runner"
      :pathname="runnerPathname"
    />
  </div>
</template>

<style scoped>
.test-pages-index {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-family: sans-serif;
  color: rgba(255, 255, 255, 0.75);
  color-scheme: dark;
}

.nav-link {
  align-self: flex-start;
  color: #8faecd;
  text-decoration: none;
}

h1 {
  margin: 0;
  color: rgba(255, 255, 255, 0.85);
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1 1 240px;
  max-width: 360px;
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.06);
  color: inherit;
  font: inherit;
  outline: none;
}

.count {
  opacity: 0.7;
  font-size: 13px;
}

.muted {
  opacity: 0.7;
}

.entries {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: 0;
  margin: 0;
  list-style: none;
}

.entry {
  display: flex;
  align-items: center;
  min-height: 26px;
  gap: 8px;
}

.guides {
  display: inline-flex;
  flex-shrink: 0;
  align-self: stretch;
}

.guide-col {
  width: 18px;
  position: relative;
  flex-shrink: 0;
}

.guide-vertical {
  position: absolute;
  left: 8.5px;
  top: 0;
  bottom: 0;
  border-left: 1px dotted rgba(255, 255, 255, 0.22);
}

.guide-vertical--branch-last {
  bottom: 50%;
}

.guide-branch {
  position: absolute;
  left: 8.5px;
  top: 50%;
  width: 11px;
  border-bottom: 1px dotted rgba(255, 255, 255, 0.22);
}

.entry-link {
  color: #8faecd;
  text-decoration: none;
}

.highlight {
  background: rgba(96, 140, 190, 0.35);
  color: inherit;
  padding: 0 2px;
  border-radius: 2px;
}

.run-inline {
  flex-shrink: 0;
  padding: 2px 8px;
  font-size: 11px;
  line-height: 1.2;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  font-family: inherit;
}

.run-inline:hover {
  background: rgba(255, 255, 255, 0.14);
}
</style>

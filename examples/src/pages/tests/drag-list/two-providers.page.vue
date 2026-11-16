<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

import { DragDropProvider, DragList } from '@infinite-table/infinite-vue';

type LoggedCall = { name: string; [key: string]: any };
type ListName = 'first' | 'second';

const itemStyle = {
  height: '40px',
  boxSizing: 'border-box',
  border: '1px solid gray',
  background: 'white',
  color: 'black',
} as const;

const LIST_NAMES: ListName[] = ['first', 'second'];

// A provider with one list in it, twice. Both lists have items with the
// same ids, the lists themselves have different ids.
const lists = reactive<Record<ListName, string[]>>({
  first: ['a', 'b', 'c'],
  second: ['a', 'b', 'c'],
});
const calls = ref<LoggedCall[]>([]);

const log = (call: LoggedCall) => {
  calls.value = [...calls.value, call];
};

const onDrop = (name: ListName, sortedIndexes: number[], options: any) => {
  log({ name: `${name}.onDrop`, dragItemId: options.dragItemId });

  const items = lists[name];
  lists[name] = sortedIndexes.map((index) => items[index]);
};

const onRemove = (name: ListName, sortedIndexes: number[], options: any) => {
  log({ name: `${name}.onRemove`, dragItemId: options.dragItemId });

  const items = lists[name];
  lists[name] = sortedIndexes.map((index) => items[index]);
};

const onAcceptDrop = (name: ListName, options: any) => {
  log({ name: `${name}.onAcceptDrop`, dragItemId: options.dragItemId });
};

// the specs wait for this before they drag
const ready = ref(false);
onMounted(() => {
  ready.value = true;
});
</script>

<template>
  <div :style="{ padding: '20px' }" :data-ready="ready">
    <div :style="{ display: 'flex', gap: '50px' }">
      <DragDropProvider v-for="name in LIST_NAMES" :key="name">
        <DragList
          :dragListId="name"
          orientation="vertical"
          :onDrop="(sortedIndexes: number[], options: any) => onDrop(name, sortedIndexes, options)"
          :onRemove="(sortedIndexes: number[], options: any) => onRemove(name, sortedIndexes, options)"
          :onAcceptDrop="(options: any) => onAcceptDrop(name, options)"
          v-slot="{ domProps }"
        >
          <div
            v-bind="domProps"
            :data-name="name"
            :style="{ width: '200px', height: '240px', background: '#eee' }"
          >
            <DragList.DraggableItem
              v-for="id in lists[name]"
              :key="id"
              :id="id"
              v-slot="{ domProps: itemDomProps }"
            >
              <div v-bind="itemDomProps" :style="itemStyle">{{ id }}</div>
            </DragList.DraggableItem>
          </div>
        </DragList>
      </DragDropProvider>
    </div>

    <pre data-name="log">{{ JSON.stringify(calls) }}</pre>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { DragDropProvider, DragList } from '@infinite-table/infinite-vue';

type LoggedCall = { name: string; [key: string]: any };

const itemStyle = {
  height: '40px',
  boxSizing: 'border-box',
  border: '1px solid gray',
  background: 'white',
  color: 'black',
} as const;

// 30 items of 40px in a list of 200px: the list scrolls by 1000px
const scrollListStyle = {
  width: '200px',
  height: '200px',
  overflowY: 'auto',
  background: '#eee',
} as const;

const ACCEPT_DROPS_FROM = ['long', 'short'];

const long = ref(Array.from({ length: 30 }, (_, index) => `item-${index}`));
const short = ref(['new-1', 'new-2']);
const calls = ref<LoggedCall[]>([]);

const log = (call: LoggedCall) => {
  calls.value = [...calls.value, call];
};

const onLongDrop = (sortedIndexes: number[], options: any) => {
  log({
    name: 'long.onDrop',
    dragIndex: options.dragIndex,
    dropIndex: options.dropIndex,
  });
  long.value = sortedIndexes.map((index) => long.value[index]);
};

const onLongAcceptDrop = (options: any) => {
  log({ name: 'long.onAcceptDrop', ...options });

  const newItems = [...long.value];
  newItems.splice(options.dropIndex, 0, options.dragItemId);
  long.value = newItems;
};

const onShortDrop = () => {};

const onShortRemove = (sortedIndexes: number[], options: any) => {
  log({ name: 'short.onRemove', dragItemId: options.dragItemId });
  short.value = sortedIndexes.map((index) => short.value[index]);
};

// the specs wait for this before they drag
const ready = ref(false);
onMounted(() => {
  ready.value = true;
});
</script>

<template>
  <div :style="{ padding: '20px' }" :data-ready="ready">
    <DragDropProvider>
      <div :style="{ display: 'flex', gap: '50px' }">
        <DragList
          dragListId="long"
          orientation="vertical"
          :acceptDropsFrom="ACCEPT_DROPS_FROM"
          :onDrop="onLongDrop"
          :onAcceptDrop="onLongAcceptDrop"
          v-slot="{ domProps }"
        >
          <div v-bind="domProps" data-name="long" :style="scrollListStyle">
            <DragList.DraggableItem
              v-for="id in long"
              :key="id"
              :id="id"
              v-slot="{ domProps: itemDomProps }"
            >
              <div v-bind="itemDomProps" :style="itemStyle">{{ id }}</div>
            </DragList.DraggableItem>
          </div>
        </DragList>

        <DragList
          dragListId="short"
          orientation="vertical"
          :onDrop="onShortDrop"
          :onRemove="onShortRemove"
          v-slot="{ domProps }"
        >
          <div
            v-bind="domProps"
            data-name="short"
            :style="{ width: '200px', height: '200px', background: '#eee' }"
          >
            <DragList.DraggableItem
              v-for="id in short"
              :key="id"
              :id="id"
              v-slot="{ domProps: itemDomProps }"
            >
              <div v-bind="itemDomProps" :style="itemStyle">{{ id }}</div>
            </DragList.DraggableItem>
          </div>
        </DragList>
      </div>
    </DragDropProvider>

    <pre data-name="log">{{ JSON.stringify(calls) }}</pre>
  </div>
</template>

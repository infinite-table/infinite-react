<script setup lang="ts">
import { defineComponent, h, onMounted, reactive, ref } from 'vue';

import {
  DragDropProvider,
  DragList,
  useDragDropProvider,
  useDragListContext,
} from '@infinite-table/infinite-vue';

type LoggedCall = { name: string; [key: string]: any };
type ListName = 'left' | 'right';

const itemStyle = {
  height: '40px',
  boxSizing: 'border-box',
  border: '1px solid gray',
  background: 'white',
  color: 'black',
} as const;

const ACCEPT_DROPS_FROM = ['left', 'right'];
const LIST_NAMES: ListName[] = ['left', 'right'];

/**
 * Shows what useDragDropProvider gives.
 */
const ProviderState = defineComponent({
  setup() {
    const dragDropProvider = useDragDropProvider();

    return () => {
      const { dragSourceListId, dropTargetListId, dragItemId, status } =
        dragDropProvider.value;

      return h(
        'pre',
        { 'data-name': 'provider-state' },
        JSON.stringify({
          dragSourceListId,
          dropTargetListId,
          dragItemId,
          status,
        }),
      );
    };
  },
});

/**
 * Shows what useDragListContext gives, inside a list.
 */
const ListState = defineComponent({
  setup() {
    const dragListContext = useDragListContext();

    return () => {
      const {
        dragListId,
        draggingInProgress,
        dragSourceListId,
        dropTargetListId,
      } = dragListContext.value;

      return h(
        'pre',
        { 'data-name': `list-state-${dragListId}` },
        JSON.stringify({
          dragListId,
          draggingInProgress,
          dragSourceListId,
          dropTargetListId,
        }),
      );
    };
  },
});

const lists = reactive<Record<ListName, string[]>>({
  left: ['a', 'b', 'c'],
  right: ['x', 'y', 'z'],
});
const calls = ref<LoggedCall[]>([]);

const log = (call: LoggedCall) => {
  calls.value = [...calls.value, call];
};

const onDrop = (name: ListName, sortedIndexes: number[], options: any) => {
  log({ name: `${name}.onDrop`, sortedIndexes, ...options });

  const items = lists[name];
  lists[name] = sortedIndexes.map((index) => items[index]);
};

const onRemove = (name: ListName, sortedIndexes: number[], options: any) => {
  log({ name: `${name}.onRemove`, sortedIndexes, ...options });

  const items = lists[name];
  lists[name] = sortedIndexes.map((index) => items[index]);
};

const onAcceptDrop = (name: ListName, options: any) => {
  log({ name: `${name}.onAcceptDrop`, ...options });

  const newItems = [...lists[name]];
  newItems.splice(options.dropIndex, 0, options.dragItemId);
  lists[name] = newItems;
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
          v-for="name in LIST_NAMES"
          :key="name"
          :dragListId="name"
          orientation="vertical"
          :acceptDropsFrom="ACCEPT_DROPS_FROM"
          :onDrop="(sortedIndexes: number[], options: any) => onDrop(name, sortedIndexes, options)"
          :onRemove="(sortedIndexes: number[], options: any) => onRemove(name, sortedIndexes, options)"
          :onAcceptDrop="(options: any) => onAcceptDrop(name, options)"
          v-slot="{ domProps }"
        >
          <div :style="{ width: '200px' }">
            <div
              v-bind="domProps"
              :data-name="name"
              :style="{ height: '240px', background: '#eee' }"
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
            <ListState />
          </div>
        </DragList>
      </div>
      <ProviderState />
    </DragDropProvider>

    <pre data-name="log">{{ JSON.stringify(calls) }}</pre>
  </div>
</template>

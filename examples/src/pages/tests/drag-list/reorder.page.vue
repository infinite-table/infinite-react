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

const vertical = ref(['one', 'two', 'three', 'four', 'five']);
const horizontal = ref(['a', 'b', 'c', 'd']);
const withHandle = ref([1, 2, 3]);
const log = ref<LoggedCall[]>([]);

const onVerticalDrop = (sortedIndexes: number[], options: any) => {
  log.value = [
    ...log.value,
    { name: 'vertical.onDrop', sortedIndexes, ...options },
  ];
  vertical.value = sortedIndexes.map((index) => vertical.value[index]);
};

const onHorizontalDrop = (sortedIndexes: number[], options: any) => {
  log.value = [
    ...log.value,
    { name: 'horizontal.onDrop', sortedIndexes, ...options },
  ];
  horizontal.value = sortedIndexes.map((index) => horizontal.value[index]);
};

const onWithHandleDrop = (sortedIndexes: number[], options: any) => {
  log.value = [
    ...log.value,
    { name: 'with-handle.onDrop', sortedIndexes, ...options },
  ];
  withHandle.value = sortedIndexes.map((index) => withHandle.value[index]);
};

// only the handle starts a drag
const withoutPointerDown = (itemDomProps: Record<string, any>) => {
  const { onPointerdown, ...rest } = itemDomProps;

  return rest;
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
      <DragList
        dragListId="vertical"
        orientation="vertical"
        :onDrop="onVerticalDrop"
        v-slot="{ domProps }"
      >
        <div v-bind="domProps" data-name="vertical" :style="{ width: '200px' }">
          <DragList.DraggableItem
            v-for="id in vertical"
            :key="id"
            :id="id"
            v-slot="{ domProps: itemDomProps }"
          >
            <div v-bind="itemDomProps" :style="itemStyle">{{ id }}</div>
          </DragList.DraggableItem>
        </div>
      </DragList>

      <DragList
        dragListId="horizontal"
        orientation="horizontal"
        dragStrategy="inline"
        :onDrop="onHorizontalDrop"
        v-slot="{ domProps }"
      >
        <div
          v-bind="domProps"
          data-name="horizontal"
          :style="{ display: 'flex', width: '320px', marginTop: '40px' }"
        >
          <DragList.DraggableItem
            v-for="id in horizontal"
            :key="id"
            :id="id"
            v-slot="{ domProps: itemDomProps }"
          >
            <div v-bind="itemDomProps" :style="{ ...itemStyle, width: '80px' }">
              {{ id }}
            </div>
          </DragList.DraggableItem>
        </div>
      </DragList>

      <DragList
        dragListId="with-handle"
        orientation="vertical"
        :onDrop="onWithHandleDrop"
        v-slot="{ domProps }"
      >
        <div
          v-bind="domProps"
          data-name="with-handle"
          :style="{ width: '200px', marginTop: '40px' }"
        >
          <DragList.DraggableItem
            v-for="id in withHandle"
            :key="id"
            :id="id"
            v-slot="{ domProps: itemDomProps }"
          >
            <div
              v-bind="withoutPointerDown(itemDomProps)"
              :style="{ ...itemStyle, display: 'flex', gap: '10px' }"
            >
              <span
                data-name="handle"
                @pointerdown="itemDomProps.onPointerdown"
                :style="{ width: '30px', background: 'silver' }"
              />
              <span data-name="label">item {{ id }}</span>
            </div>
          </DragList.DraggableItem>
        </div>
      </DragList>
    </DragDropProvider>

    <pre data-name="log">{{ JSON.stringify(log) }}</pre>
  </div>
</template>

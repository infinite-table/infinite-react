<script setup lang="ts">
import { h, onMounted, ref, Teleport } from 'vue';

import { DragDropProvider, DragList } from '@infinite-table/infinite-vue';
import type { DragListProps } from '@infinite-table/infinite-vue';

type LoggedCall = { name: string; [key: string]: any };

const itemStyle = {
  height: '40px',
  boxSizing: 'border-box',
  border: '1px solid gray',
  background: 'white',
  color: 'black',
} as const;

const listStyle = { width: '200px', height: '240px', background: '#eee' };

// the proxy is rendered by the page, in the body
const renderDragProxy: DragListProps['renderDragProxy'] = ({
  dragItemId,
  initialRect,
  dx,
  dy,
  ref,
}) => {
  if (!dragItemId) {
    return null;
  }

  return h(
    Teleport,
    { to: 'body' },
    h(
      'div',
      {
        ref,
        'data-name': 'rendered-proxy',
        style: {
          position: 'fixed',
          top: `${initialRect.top + dy}px`,
          left: `${initialRect.left + dx}px`,
          width: `${initialRect.width}px`,
          height: `${initialRect.height}px`,
          background: 'yellow',
          pointerEvents: 'none',
        },
      },
      `dragging ${dragItemId}`,
    ),
  );
};

const rendered = ref(['a', 'b', 'c']);
const customized = ref(['x', 'y', 'z']);
const calls = ref<LoggedCall[]>([]);

const log = (call: LoggedCall) => {
  calls.value = [...calls.value, call];
};

// the default proxy, changed by the page
const onDragProxySetup: DragListProps['onDragProxySetup'] = (params) => {
  const { proxyElement, dragItemId } = params;

  log({ name: 'onDragProxySetup', dragItemId });
  proxyElement.setAttribute('data-name', 'customized-proxy');

  return {
    cleanup: ({ proxyElement }) => {
      log({ name: 'cleanup' });
      proxyElement.remove();
    },
  };
};

const onDragProxyMove: DragListProps['onDragProxyMove'] = ({
  proxyElement,
  dx,
  dy,
}) => {
  // moved with margins, not with the default transform
  proxyElement.style.marginLeft = `${dx}px`;
  proxyElement.style.marginTop = `${dy}px`;
  proxyElement.setAttribute('data-moved-by', `${dx},${dy}`);
};

const onRenderedDrop = (sortedIndexes: number[]) => {
  log({ name: 'rendered.onDrop', sortedIndexes });
  rendered.value = sortedIndexes.map((index) => rendered.value[index]);
};

const onCustomizedDrop = (sortedIndexes: number[]) => {
  log({ name: 'customized.onDrop', sortedIndexes });
  customized.value = sortedIndexes.map((index) => customized.value[index]);
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
          dragListId="rendered"
          orientation="vertical"
          :renderDragProxy="renderDragProxy"
          :onDrop="onRenderedDrop"
          v-slot="{ domProps }"
        >
          <div v-bind="domProps" data-name="rendered" :style="listStyle">
            <DragList.DraggableItem
              v-for="id in rendered"
              :key="id"
              :id="id"
              v-slot="{ domProps: itemDomProps }"
            >
              <div v-bind="itemDomProps" :style="itemStyle">{{ id }}</div>
            </DragList.DraggableItem>
          </div>
        </DragList>

        <DragList
          dragListId="customized"
          orientation="vertical"
          preserveDragSpace
          :onDragProxySetup="onDragProxySetup"
          :onDragProxyMove="onDragProxyMove"
          :onDrop="onCustomizedDrop"
          v-slot="{ domProps }"
        >
          <div v-bind="domProps" data-name="customized" :style="listStyle">
            <DragList.DraggableItem
              v-for="id in customized"
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

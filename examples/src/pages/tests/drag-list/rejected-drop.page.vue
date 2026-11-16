<script setup lang="ts">
import { defineComponent, h, onMounted, ref } from 'vue';
import type { PropType } from 'vue';

import {
  DragDropProvider,
  DragList,
  useDragDropProvider,
} from '@infinite-table/infinite-vue';
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

const ACCEPT_DROPS_FROM_SOURCE = ['source'];

// the target takes every item but the one called "locked"
const shouldAcceptDrop: DragListProps['shouldAcceptDrop'] = (event) =>
  event.dragItem.id !== 'locked';

const renderItems = (items: string[]) =>
  items.map((id) =>
    h(
      DragList.DraggableItem,
      { key: id, id },
      {
        default: ({ domProps }: { domProps: Record<string, any> }) =>
          h('div', { ...domProps, style: itemStyle }, id),
      },
    ),
  );

/**
 * The two lists, written with render functions.
 */
const Lists = defineComponent({
  props: {
    log: {
      type: Function as PropType<(call: LoggedCall) => void>,
      required: true,
    },
  },
  setup(props) {
    const source = ref(['free', 'locked', 'other']);
    const target = ref(['t1', 't2']);

    const dragDropProvider = useDragDropProvider();

    const onRemove: DragListProps['onRemove'] = (sortedIndexes, options) => {
      // the provider still has the state of the drag when the callbacks run
      const { status, dropTargetListId } =
        dragDropProvider.value.getCurrentDragSourceAndTarget();

      props.log({
        name: 'source.onRemove',
        ...options,
        status,
        dropTargetListId,
      });

      if (status === 'rejected') {
        return;
      }
      source.value = sortedIndexes.map((index) => source.value[index]);
    };

    const onAcceptDrop: DragListProps['onAcceptDrop'] = (options) => {
      props.log({ name: 'target.onAcceptDrop', ...options });

      const newItems = [...target.value];
      newItems.splice(options.dropIndex, 0, options.dragItemId);
      target.value = newItems;
    };

    return () =>
      h('div', { style: { display: 'flex', gap: '50px' } }, [
        h(
          DragList,
          {
            dragListId: 'source',
            orientation: 'vertical',
            onDrop: (sortedIndexes: number[]) => {
              props.log({ name: 'source.onDrop', sortedIndexes });
              source.value = sortedIndexes.map((index) => source.value[index]);
            },
            onRemove,
          },
          {
            default: ({ domProps }: { domProps: Record<string, any> }) =>
              h(
                'div',
                { ...domProps, 'data-name': 'source', style: listStyle },
                renderItems(source.value),
              ),
          },
        ),
        h(
          DragList,
          {
            dragListId: 'target',
            orientation: 'vertical',
            acceptDropsFrom: ACCEPT_DROPS_FROM_SOURCE,
            shouldAcceptDrop,
            onDrop: (sortedIndexes: number[]) => {
              props.log({ name: 'target.onDrop', sortedIndexes });
            },
            onAcceptDrop,
          },
          {
            default: ({ domProps }: { domProps: Record<string, any> }) =>
              h(
                'div',
                { ...domProps, 'data-name': 'target', style: listStyle },
                renderItems(target.value),
              ),
          },
        ),
      ]);
  },
});

const calls = ref<LoggedCall[]>([]);

const log = (call: LoggedCall) => {
  calls.value = [...calls.value, call];
};

// the specs wait for this before they drag
const ready = ref(false);
onMounted(() => {
  ready.value = true;
});
</script>

<template>
  <div :style="{ padding: '20px' }" :data-ready="ready">
    <DragDropProvider
      v-slot="{ dragSourceListId, dropTargetListId, dragItemId, status }"
    >
      <Lists :log="log" />
      <pre data-name="provider-state">{{
        JSON.stringify({
          dragSourceListId,
          dropTargetListId,
          dragItemId,
          status,
        })
      }}</pre>
    </DragDropProvider>

    <pre data-name="log">{{ JSON.stringify(calls) }}</pre>
  </div>
</template>

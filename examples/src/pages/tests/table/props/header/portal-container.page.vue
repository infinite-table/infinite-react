<script setup lang="ts">
import { defineComponent, h, nextTick, ref, Teleport, watch } from 'vue';

import {
  InfiniteTable,
  DataSource,
  alignNode,
  useInfiniteHeaderCell,
  useInfinitePortalContainer,
} from '@infinite-table/infinite-vue';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-vue';

type Item = {
  id: number;
  name: string;
};

const data: Item[] = Array.from({ length: 20 }, (_, id) => ({
  id,
  name: `Item ${id}`,
}));

const HeaderWithPopup = defineComponent({
  name: 'HeaderWithPopup',
  setup() {
    const headerCell = useInfiniteHeaderCell<Item>();
    const portalContainer = useInfinitePortalContainer();
    const visible = ref(false);
    const domRef = ref<HTMLDivElement | null>(null);

    watch(visible, async (value) => {
      await nextTick();
      const alignTo = headerCell.value.htmlElementRef.current;
      if (value && domRef.value && alignTo) {
        alignNode(domRef.value, {
          alignTo,
          alignPosition: [['TopRight', 'BottomRight']],
        });
      }
    });

    return () =>
      h('div', [
        h(
          'button',
          {
            'data-name': 'toggle-popup',
            onClick: () => {
              visible.value = !visible.value;
            },
          },
          headerCell.value.column.id,
        ),
        visible.value && portalContainer.value
          ? h(Teleport, { to: portalContainer.value }, [
              h(
                'div',
                {
                  ref: domRef,
                  'data-name': 'popup',
                  style: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '150px',
                    height: '50px',
                    background: 'tomato',
                  },
                },
                'popup',
              ),
            ])
          : null,
      ]);
  },
});

const columns: InfiniteTablePropColumns<Item> = {
  id: { field: 'id' },
  name: {
    field: 'name',
    defaultWidth: 300,
    renderHeader: () => h(HeaderWithPopup),
  },
};

const domProps = {
  style: {
    height: '60vh',
    margin: '40px',
  },
};
</script>

<template>
  <DataSource :data="data" primaryKey="id">
    <InfiniteTable :domProps="domProps" :columns="columns" />
  </DataSource>
</template>

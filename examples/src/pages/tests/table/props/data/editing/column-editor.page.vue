<script setup lang="ts">
import { defineComponent, h, ref } from 'vue';

import {
  DataSource,
  InfiniteTable,
  useInfiniteColumnEditor,
} from '@infinite-table/infinite-vue';

import {
  type Developer,
  data,
  height100DomProps,
} from './common';

const CustomEditor = defineComponent({
  setup() {
    const { initialValue, confirmEdit, cancelEdit } = useInfiniteColumnEditor();

    const domRef = ref<HTMLInputElement | null>(null);

    const refCallback = (node: any) => {
      domRef.value = node;
      if (node) {
        (node as HTMLInputElement).focus();
      }
    };

    const onKeydown = (event: KeyboardEvent) => {
      const { key } = event;
      if (key === 'Enter' || key === 'Tab') {
        confirmEdit(domRef.value?.value + 'ABC');
      } else if (key === 'Escape') {
        cancelEdit();
      } else {
        event.stopPropagation();
      }
    };

    return () =>
      h('div', { style: { border: '2px solid red' } }, [
        h('input', {
          style: { width: '100%' },
          ref: refCallback,
          value: initialValue,
          onKeydown,
        }),
      ]);
  },
});

const columns: Record<string, any> = {
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
    components: {
      Editor: CustomEditor,
    },
  },
  age: {
    field: 'age',
    type: 'number',
    defaultEditable: false,
  },
  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
};

</script>

<template>
  <DataSource :data="data" primaryKey="id">
    <InfiniteTable
      :domProps="height100DomProps"
      :columnDefaultEditable="true"
      :columnDefaultWidth="150"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>

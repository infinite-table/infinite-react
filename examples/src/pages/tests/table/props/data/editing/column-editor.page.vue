<script setup lang="ts">
import { defineComponent, h, ref } from 'vue';

import {
  DataSource,
  InfiniteTable,
  useInfiniteColumnEditor,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  age: number;
};

const data: Developer[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Bob',
    age: 20,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 2,
    firstName: 'Marry',
    lastName: 'Bob',
    age: 25,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 3,
    firstName: 'Bill',
    lastName: 'Bobson',
    age: 30,
    canDesign: 'no',
    currency: 'CAD',
    preferredLanguage: 'TypeScript',
    stack: 'frontend',
  },
  {
    id: 4,
    firstName: 'Mark',
    lastName: 'Twain',
    age: 31,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Rust',
    stack: 'backend',
  },
  {
    id: 5,
    firstName: 'Matthew',
    lastName: 'Hilson',
    age: 29,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Go',
    stack: 'backend',
  },
];

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

const domProps = {
  style: {
    height: '100%',
  },
};
</script>

<template>
  <DataSource :data="data" primaryKey="id">
    <InfiniteTable
      :domProps="domProps"
      :columnDefaultEditable="true"
      :columnDefaultWidth="150"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>

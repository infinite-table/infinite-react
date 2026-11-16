<script setup lang="ts">
import { defineComponent, h, onMounted, ref } from 'vue';
import {
  InfiniteTable,
  DataSource,
  useInfiniteColumnEditor,
} from '@infinite-table/infinite-vue';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  currency: string;
  stack: string;
  hobby: string;
  salary: string;
};
const dataSource: Developer[] = [
  {
    id: 1,
    firstName: 'John',
    currency: 'USD',
    stack: 'frontend',
    hobby: 'gaming',
    salary: 'USD 1000',
  },
  {
    id: 2,
    firstName: 'Jane',
    currency: 'EUR',
    stack: 'backend',
    hobby: 'reading',
    salary: 'EUR 2000',
  },
  {
    id: 3,
    firstName: 'Jack',
    currency: 'GBP',
    stack: 'frontend',
    hobby: 'gaming',
    salary: 'GBP 3000',
  },
  {
    id: 4,
    firstName: 'Jill',
    currency: 'USD',
    stack: 'backend',
    hobby: 'reading',
    salary: 'USD 4000',
  },
];

const CustomEditor = defineComponent({
  setup() {
    const { initialValue, confirmEdit, cancelEdit } = useInfiniteColumnEditor();

    const domRef = ref<HTMLInputElement | null>(null);

    onMounted(() => {
      domRef.value?.focus();
    });

    const onKeydown = (event: KeyboardEvent) => {
      const { key } = event;
      if (key === 'Enter' || key === 'Tab') {
        confirmEdit(domRef.value?.value);
      } else if (key === 'Escape') {
        cancelEdit();
      } else {
        event.stopPropagation();
      }
    };

    return () =>
      h(
        'div',
        {
          style: {
            background: '#ad1',
            padding: '5px',
            width: '100%',
            height: '100%',
            position: 'absolute',
            left: 0,
            top: 0,
          },
        },
        h('input', {
          style: { width: '100%', height: '100%' },
          ref: domRef,
          value: initialValue,
          onKeydown,
        }),
      );
  },
});

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 80, defaultEditable: false },

  salary: {
    components: {
      // reference to the custom editor component
      Editor: CustomEditor,
    },

    defaultWidth: 320,
    field: 'salary',
    header: 'Salary - edit accepts numbers only',
    style: { color: 'tomato' },
    getValueToEdit: ({ value }) => {
      return parseInt(value.substr(4), 10);
    },
    getValueToPersist: ({ value, data }) => {
      return `${data!.currency} ${parseInt(value, 10)}`;
    },
    shouldAcceptEdit: ({ value }) => {
      return parseInt(value, 10) == value;
    },
  },

  firstName: {
    field: 'firstName',
    header: 'Name',
  },
  currency: {
    field: 'currency',
    header: 'Currency',
  },
};
</script>

<template>
  <DataSource primaryKey="id" :data="dataSource">
    <InfiniteTable
      debugId="custom-editor-example"
      :columns="columns"
      :columnDefaultEditable="true"
    />
  </DataSource>
</template>

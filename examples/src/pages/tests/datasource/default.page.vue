<script setup lang="ts">
import { defineComponent, h } from 'vue';

import { DataSource, useDataSourceContext } from '@infinite-table/infinite-vue';

interface Person {
  name: string;
  age: number;
  id: string | number;
}

const persons: Person[] = [
  { name: 'bob', age: 1, id: 1 },
  { name: 'bill', age: 2, id: 2 },
];

const Cmp = defineComponent({
  setup() {
    const context = useDataSourceContext<Person>();

    return () => {
      const { dataArray, loading } = context.state.value;

      return h(
        'div',
        { 'aria-label': 'container', style: { color: 'tomato' } },
        loading ? 'loading' : JSON.stringify(dataArray),
      );
    };
  },
});

const personsPromise: Promise<Person[]> = new Promise((resolve) => {
  setTimeout(() => {
    resolve(persons);
  }, 200);
});

const fields = ['name', 'id', 'age'] as const;
</script>

<template>
  <DataSource :data="personsPromise" primaryKey="id" :fields="fields">
    <Cmp />
  </DataSource>
</template>

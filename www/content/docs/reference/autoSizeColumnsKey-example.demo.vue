<script setup lang="ts">
import { computed, ref } from 'vue';
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
  country: { field: 'country' },
  age: { field: 'age', type: 'number' },
  salary: { field: 'salary', type: 'number' },
  currency: { field: 'currency', type: 'number' },
};

const key = ref(0);
const includeHeader = ref(false);

const autoSizeColumnsKey = computed(() => {
  return {
    includeHeader: includeHeader.value,
    key: key.value,
  };
});
</script>

<template>
  <div
    :style="{
      color: 'var(--infinite-cell-color)',
      background: 'var(--infinite-background)',
    }"
  >
    <label>
      <input v-model="includeHeader" type="checkbox" />
      Include header
    </label>

    <button
      :style="{
        margin: '10px',
        padding: '10px',
        borderRadius: '5px',
        border: '2px solid magenta',
      }"
      @click="key = key + 1"
    >
      Click to auto-size
    </button>
  </div>

  <DataSource primaryKey="id" :data="dataSource">
    <InfiniteTable
      debugId="autoSizeColumnsKey-example"
      :autoSizeColumnsKey="autoSizeColumnsKey"
      :columns="columns"
      :columnDefaultWidth="200"
    />
  </DataSource>
</template>

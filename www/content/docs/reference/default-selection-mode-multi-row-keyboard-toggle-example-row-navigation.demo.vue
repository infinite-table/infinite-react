<script setup lang="ts">
import { ref } from 'vue';
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-vue';

const columns: InfiniteTablePropColumns<Developer> = {
  country: {
    field: 'country',
  },
  firstName: {
    field: 'firstName',
  },
  stack: {
    field: 'stack',
  },
  age: { field: 'age' },
  id: { field: 'id' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  canDesign: { field: 'canDesign' },
};

const keyboardSelection = ref(true);

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};
</script>

<template>
  <div
    :style="{
      color: 'var(--infinite-cell-color)',
      padding: '10px',
    }"
  >
    Keyboard selection is now
    <b>{{ keyboardSelection ? 'enabled' : 'disabled' }}</b>.
    <button
      :style="{
        border: '1px solid tomato',
        display: 'block',
        padding: '5px',
        marginTop: '10px',
      }"
      @click="keyboardSelection = !keyboardSelection"
    >
      Click to toggle keyboard selection
    </button>
  </div>
  <DataSource :data="dataSource" selectionMode="multi-row" primaryKey="id">
    <InfiniteTable
      debugId="default-selection-mode-multi-row-keyboard-toggle-example-row-navigation"
      keyboardNavigation="row"
      :keyboardSelection="keyboardSelection"
      :columns="columns"
      :columnDefaultWidth="150"
    />
  </DataSource>
</template>

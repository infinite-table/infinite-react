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

const rowSelection = ref<number | null | string>(3);

const setRowSelection = (value: number | null | string) => {
  rowSelection.value = value;
};

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
  <p
    :style="{
      color: 'var(--infinite-cell-color)',
      padding: '10px',
    }"
  >
    Current row selection:<code :style="{ display: 'inline-block' }">
      <pre> {{ JSON.stringify(rowSelection) }}.</pre>
    </code>
  </p>

  <DataSource
    :data="dataSource"
    :rowSelection="rowSelection"
    :onRowSelectionChange="setRowSelection"
    primaryKey="id"
  >
    <InfiniteTable
      debugId="controlled-single-row-selection-example"
      :columns="columns"
      :columnDefaultWidth="150"
    />
  </DataSource>
</template>

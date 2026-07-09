<script setup lang="ts">
import { ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

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

const columns: Record<string, any> = {
  firstName: {
    field: 'firstName',
  },
  age: {
    field: 'age',
    type: 'number',
  },

  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
};

//@ts-ignore
globalThis.dataSourceCalls = 0;

const refetchKey = ref(1);

const dataSource = ({ refetchKey }: { refetchKey?: number | string }) => {
  //@ts-ignore
  globalThis.dataSourceCalls += 1;
  console.log('refetchKey', refetchKey);
  return Promise.resolve(
    refetchKey && (refetchKey as number) % 2 === 0
      ? data.slice(0, 2)
      : data.slice(0, data.length),
  );
};

const refetch = () => {
  refetchKey.value += 1;
};

const shouldReloadData = {
  sortInfo: false,
};

const domProps = {
  style: {
    minHeight: '500px',
  },
};
</script>

<template>
  <button @click="refetch">refetch</button>
  <DataSource
    :refetchKey="refetchKey"
    :data="dataSource"
    primaryKey="id"
    :shouldReloadData="shouldReloadData"
  >
    <InfiniteTable :columns="columns" :domProps="domProps" />
  </DataSource>
</template>

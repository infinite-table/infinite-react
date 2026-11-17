<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import type {
  DataSourceApi,
  InfiniteTablePropColumns,
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

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
  },
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

const currencies = ['USD', 'CAD', 'EUR', 'GBP', 'RUB', 'UAH', 'CNY'];
const stacks = ['frontend', 'backend', 'fullstack'];
const languages = [
  'JavaScript',
  'TypeScript',
  'Go',
  'Rust',
  'Python',
  'Java',
  'C#',
];
const getRandomDeveloperUpdate = (data: Developer): Partial<Developer> => ({
  id: data.id,
  age: Math.floor(Math.random() * (60 - 20 + 1)) + 20,
  canDesign: ['yes', 'no'][
    Math.floor(Math.random() * 2)
  ] as Developer['canDesign'],

  currency: currencies[Math.floor(Math.random() * currencies.length)],
  preferredLanguage: languages[Math.floor(Math.random() * languages.length)],
  stack: stacks[Math.floor(Math.random() * stacks.length)],
});

const dataSourceApi = shallowRef<DataSourceApi<Developer>>();
const activeIndex = ref(0);

const onReady = (api: DataSourceApi<Developer>) => {
  dataSourceApi.value = api;
};

const onActiveRowIndexChange = (index: number) => {
  activeIndex.value = index;
};

const updateCurrentRow = () => {
  const rowInfo = dataSourceApi.value!.getRowInfoByIndex(activeIndex.value);
  if (rowInfo && rowInfo.data) {
    dataSourceApi.value!.updateData(
      getRandomDeveloperUpdate(rowInfo.data as Developer),
    );
  }
};
</script>

<template>
  <button @click="updateCurrentRow">Update current row</button>

  <DataSource :data="data" primaryKey="id" :onReady="onReady">
    <InfiniteTable
      debugId="simple-updateData-example"
      :activeRowIndex="activeIndex"
      :onActiveRowIndexChange="onActiveRowIndexChange"
      keyboardNavigation="row"
      :columnDefaultWidth="100"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>

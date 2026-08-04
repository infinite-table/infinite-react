<script setup lang="ts">
import { ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { data } from './pivot-grouping-example-data';

const columns: Record<string, any> = {
  id: { field: 'id' },
  name: { field: 'name' },
  language: { field: 'language' },
  license: { field: 'license' },
};

const countReducer = {
  initialValue: 0,
  reducer: (acc: number) => acc + 1,
};

const sumReducer = {
  initialValue: 0,
  reducer: (acc: number, value: number) => acc + value,
};

const initialReducers: Record<string, any> = {
  stargazers_count: {
    ...sumReducer,
    name: 'Stars (sum)',
    field: 'stargazers_count',
  },
  license: {
    ...countReducer,
    name: 'License (count)',
    field: 'license',
  },
};
const groupBy = [{ field: 'language' as const }, { field: 'license' as const }];

const domProps = {
  style: {
    height: '80vh',
    width: '3000px',
  },
};

const pivotBy = ref<any[]>([{ field: 'has_wiki' }]);

const reducers = ref<Record<string, any>>(initialReducers);

const togglePivotByLanguage = () => {
  if (pivotBy.value.length == 1) {
    pivotBy.value = [
      { field: 'has_wiki' },
      {
        field: 'language',
      },
    ];
  } else {
    pivotBy.value = [{ field: 'has_wiki' }];
  }
};

const toggleMultipleAggregations = () => {
  if (reducers.value.license) {
    const newReducers = { ...initialReducers };
    delete newReducers.license;
    reducers.value = newReducers;
  } else {
    reducers.value = initialReducers;
  }
};
</script>

<template>
  <button @click="togglePivotByLanguage">toggle pivot by language</button>
  <button @click="toggleMultipleAggregations">
    toggle multiple aggregations
  </button>
  <DataSource
    primaryKey="id"
    :data="data"
    :groupBy="groupBy"
    :pivotBy="pivotBy"
    :aggregationReducers="reducers"
  >
    <template #default="{ pivotColumns, pivotColumnGroups }">
      <InfiniteTable
        :domProps="domProps"
        :columns="columns"
        :columnDefaultWidth="130"
        :hideEmptyGroupColumns="true"
        :pivotColumns="pivotColumns"
        :pivotColumnGroups="pivotColumnGroups"
      />
    </template>
  </DataSource>
</template>

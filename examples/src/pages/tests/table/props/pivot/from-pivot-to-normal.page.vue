<script setup lang="ts">
import { computed, ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { columns } from './from-pivot-to-normal-data';
import { data } from './pivot-grouping-example-data';

const dataSource = () => {
  return Promise.resolve(data);
};

const domProps = {
  style: {
    height: '80vh',
  },
};

type Config = {
  groupBy?: any[];
  pivotBy?: any[];
  agg?: Record<string, any>;
};
const noPivotConfig: Config = {};
const pivotConfig: Config = {
  ...noPivotConfig,
  groupBy: [
    {
      field: 'license',
    },
    { field: 'language' },
  ],
  pivotBy: [{ field: 'language' }],
  agg: {
    stargazers_count: {
      initialValue: 0,
      field: 'stargazers_count',
      reducer: (acc: number, row: number) => acc + row,
    },
    license_count: {
      initialValue: 0,
      field: 'license',
      reducer: (acc: number) => acc + 1,
    },
  },
};

const config = ref<Config>(pivotConfig);

const groupRowsBy = computed(() => config.value.groupBy || []);
const pivotBy = computed(() => config.value.pivotBy);
const agg = computed(() => config.value.agg);

const wrapperStyle = {
  display: 'flex',
  flex: 1,
  color: 'var(--infinite-cell-color)',
  flexFlow: 'column',
  background: 'var(--infinite-background)',
};

const emptyColumns: Record<string, any> = {};
</script>

<template>
  <div :style="wrapperStyle">
    <div style="padding: 10px">
      <button
        :disabled="config === noPivotConfig"
        @click="config = noPivotConfig"
      >
        Switch to no pivot
      </button>

      <button :disabled="config === pivotConfig" @click="config = pivotConfig">
        Switch to Pivot
      </button>
    </div>
    <DataSource
      primaryKey="id"
      :data="dataSource"
      :groupBy="groupRowsBy"
      :aggregationReducers="agg"
      :pivotBy="pivotBy"
    >
      <template #default="{ pivotColumns, pivotColumnGroups }">
        <InfiniteTable
          v-if="pivotColumns"
          :domProps="domProps"
          :columns="emptyColumns"
          :pivotColumns="pivotColumns"
          :pivotColumnGroups="pivotColumnGroups"
          :columnDefaultWidth="100"
          pivotTotalColumnPosition="end"
        />
        <InfiniteTable
          v-else
          :domProps="domProps"
          :columns="columns"
          :columnDefaultWidth="100"
        />
      </template>
    </DataSource>
  </div>
</template>

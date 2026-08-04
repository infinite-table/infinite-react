<script setup lang="ts">
import { defineComponent, watchEffect } from 'vue';

import {
  DataSource,
  InfiniteTable,
  useDataSourceContext,
} from '@infinite-table/infinite-vue';
import type { DataSourceData } from '@infinite-table/infinite-vue';

import sinon from 'sinon';

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

const columns: Record<string, any> = {
  id: { field: 'id' },
  salary: { field: 'salary' },
  age: { field: 'age' },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  lastName: { field: 'lastName' },
  country: { field: 'country' },
  city: { field: 'city' },
  currency: { field: 'currency' },
  stack: { field: 'stack' },
  canDesign: { field: 'canDesign' },
};

const dataSource: DataSourceData<Developer> = ({
  pivotBy,
  aggregationReducers,
  groupBy,

  lazyLoadStartIndex,
  lazyLoadBatchSize,
  groupKeys = [],
  sortInfo,
}: any) => {
  if (sortInfo && !Array.isArray(sortInfo)) {
    sortInfo = [sortInfo];
  }
  const startLimit: string[] = [];
  if (lazyLoadBatchSize && lazyLoadBatchSize > 0) {
    const start = lazyLoadStartIndex || 0;
    startLimit.push(`start=${start}`);
    startLimit.push(`limit=${lazyLoadBatchSize}`);
  }
  const args = [
    ...startLimit,
    pivotBy
      ? 'pivotBy=' + JSON.stringify(pivotBy.map((p: any) => ({ field: p.field })))
      : null,
    `groupKeys=${JSON.stringify(groupKeys)}`,
    groupBy
      ? 'groupBy=' + JSON.stringify(groupBy.map((p: any) => ({ field: p.field })))
      : null,
    sortInfo
      ? 'sortInfo=' +
        JSON.stringify(
          sortInfo.map((s: any) => ({
            field: s.field,
            dir: s.dir,
          })),
        )
      : null,
    aggregationReducers
      ? 'reducers=' +
        JSON.stringify(
          Object.keys(aggregationReducers).map((key) => ({
            field: aggregationReducers[key].field,
            id: key,
            name: aggregationReducers[key].reducer,
          })),
        )
      : null,
  ]
    .filter(Boolean)
    .join('&');
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers10k-sql?` + args)
    .then((r) => r.json())
    .then((data) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(data);
        }, 20);
      });
    });
};

const spiedDataSource = sinon.spy(dataSource);

const Cmp = defineComponent({
  name: 'Cmp',
  setup() {
    const context = useDataSourceContext<Developer>();

    watchEffect(() => {
      (globalThis as any).dataArrayLength =
        context.state.value.dataArray.length;
    });

    return () => null;
  },
});

const groupBy = [{ field: 'country' as const }];
const lazyLoad = { batchSize: 50 };

(globalThis as any).dataSource = spiedDataSource;

const onScrollToRowClick = () => {
  (globalThis as any).api.scrollRowIntoView(50, {
    scrollAdjustPosition: 'start',
  });
};

const onReady = ({ api }: { api: any }) => {
  (globalThis as any).api = api;
};

const domProps = {
  style: {
    height: '90vh',
  },
};
</script>

<template>
  <button @click="onScrollToRowClick">Scroll to row 50</button>
  <DataSource
    :data="spiedDataSource"
    primaryKey="id"
    :groupBy="groupBy"
    :lazyLoad="lazyLoad"
  >
    <InfiniteTable
      :columns="columns"
      :rowHeight="40"
      :scrollStopDelay="10"
      :onReady="onReady"
      :domProps="domProps"
    />
    <Cmp />
  </DataSource>
</template>

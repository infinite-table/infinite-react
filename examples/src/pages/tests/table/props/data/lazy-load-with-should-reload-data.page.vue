<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import type {
  DataSourceData,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-vue';

import sinon from 'sinon';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  salary: number;
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  lastName: { field: 'lastName' },
  country: { field: 'country' },
  salary: { field: 'salary' },
};

const lazyLoad = { batchSize: 50 };
const shouldReloadData = {
  sortInfo: true,
  filterValue: true,
  groupBy: true,
  pivotBy: true,
};

const dataSource: DataSourceData<Developer> = ({
  lazyLoadStartIndex,
  lazyLoadBatchSize,
  sortInfo,
}: any) => {
  if (sortInfo && !Array.isArray(sortInfo)) {
    sortInfo = [sortInfo];
  }
  const args = [
    `start=${lazyLoadStartIndex || 0}`,
    `limit=${lazyLoadBatchSize}`,
    sortInfo
      ? 'sortInfo=' +
        JSON.stringify(
          sortInfo.map((s: any) => ({
            field: s.field,
            dir: s.dir,
          })),
        )
      : null,
  ]
    .filter(Boolean)
    .join('&');
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql?` + args)
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

(globalThis as any).dataSource = spiedDataSource;

const domProps = {
  style: {
    height: '90vh',
  },
};
</script>

<template>
  <DataSource
    :data="spiedDataSource"
    primaryKey="id"
    :lazyLoad="lazyLoad"
    :shouldReloadData="shouldReloadData"
  >
    <InfiniteTable
      :columns="columns"
      :rowHeight="40"
      :scrollStopDelay="10"
      :domProps="domProps"
    />
  </DataSource>
</template>

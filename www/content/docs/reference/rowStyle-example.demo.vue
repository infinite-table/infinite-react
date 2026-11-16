<script setup lang="ts">
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import type {
  InfiniteTablePropRowStyle,
  InfiniteTableRowInfo,
} from '@infinite-table/infinite-vue';

import { columns } from './rowStyle-example-columns.vue';
import type { Employee } from './rowStyle-example-columns.vue';

const rowStyle: InfiniteTablePropRowStyle<Employee> = (param: {
  rowInfo: InfiniteTableRowInfo<Employee>;
}) => {
  const { rowInfo } = param;
  if (rowInfo.isGroupRow) {
    return;
  }
  const { data } = rowInfo;
  const salary = data ? data.salary : 0;

  if (salary > 150_000) {
    return { background: 'tomato' };
  }

  if (rowInfo.indexInAll % 10 === 0) {
    return { background: 'lightblue', color: 'black' };
  }
  return undefined;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees100')
    .then((r) => r.json())
    .then((data: Employee[]) => data);
};
</script>

<template>
  <DataSource :data="dataSource" primaryKey="id">
    <InfiniteTable
      debugId="rowStyle-example"
      :columns="columns"
      :rowStyle="rowStyle"
    />
  </DataSource>
</template>

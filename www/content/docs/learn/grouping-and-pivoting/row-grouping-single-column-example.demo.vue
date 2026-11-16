<script setup lang="ts">
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import type {
  DataSourcePropGroupBy,
  InfiniteTableColumn,
} from '@infinite-table/infinite-vue';

import { columns } from './columns.vue';
import type { Employee } from './columns.vue';

const groupBy: DataSourcePropGroupBy<Employee> = [
  {
    field: 'age',
  },
  {
    field: 'companyName',
  },
];

const groupColumn: InfiniteTableColumn<Employee> = {
  header: 'Grouping',
  defaultWidth: 250,
  // in this function we have access to collapsed info
  // and grouping info about the current row - see rowInfo.groupBy
  renderGroupValue: ({ value, rowInfo }) => {
    const groupBy = rowInfo.groupBy || [];
    const collapsed = rowInfo.collapsed;
    const currentGroupBy = groupBy[groupBy.length - 1];

    if (currentGroupBy?.field === 'age') {
      return `🥳 ${value}${collapsed ? ' 🤷‍♂️' : ''}`;
    }

    return `🎉 ${value}`;
  },
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees10k')
    .then((r) => r.json())
    .then((data: Employee[]) => data);
};
</script>

<template>
  <DataSource :data="dataSource" primaryKey="id" :groupBy="groupBy">
    <InfiniteTable
      debugId="row-grouping-single-column-example"
      groupRenderStrategy="single-column"
      :groupColumn="groupColumn"
      :columns="columns"
      :columnDefaultWidth="150"
    />
  </DataSource>
</template>

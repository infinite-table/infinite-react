<script setup lang="ts">
import { h } from 'vue';
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import type {
  DataSourceGroupBy,
  InfiniteTablePropGroupColumn,
  InfiniteTableColumnRenderValueParam,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-vue';

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

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 80 },
  stack: {
    field: 'stack',
    renderValue: ({ data, rowInfo }) => {
      if (rowInfo.isGroupRow) {
        return `${rowInfo.value} stuff`;
      }

      return h('b', `🎇 ${data?.stack}`);
    },
  },
  firstName: {
    field: 'firstName',
  },

  preferredLanguage: { field: 'preferredLanguage' },
};

const defaultGroupBy: DataSourceGroupBy<Developer>[] = [{ field: 'stack' }];

const groupColumn: InfiniteTablePropGroupColumn<Developer> = {
  defaultWidth: 250,

  renderValue: ({
    rowInfo,
  }: InfiniteTableColumnRenderValueParam<Developer>) => {
    if (rowInfo.isGroupRow) {
      return ['Grouped by ', h('b', rowInfo.value)];
    }
    return null;
  },
};
</script>

<template>
  <DataSource
    primaryKey="id"
    :data="dataSource"
    :defaultGroupBy="defaultGroupBy"
  >
    <InfiniteTable
      debugId="column-renderValue-example"
      :groupColumn="groupColumn"
      :columns="columns"
      :columnDefaultWidth="200"
    />
  </DataSource>
</template>

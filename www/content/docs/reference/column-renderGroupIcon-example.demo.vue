<script setup lang="ts">
import { h } from 'vue';
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import type {
  DataSourcePropGroupBy,
  InfiniteTablePropColumns,
  InfiniteTableColumn,
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
  },
  firstName: {
    field: 'firstName',
  },

  preferredLanguage: { field: 'preferredLanguage' },
};
const groupBy: DataSourcePropGroupBy<Developer> = [
  {
    field: 'country',
    column: {
      header: 'Country group',
      renderGroupValue: ({ value }) => `Country: ${value}`,
    },
  },
  { field: 'preferredLanguage' },
];

const groupColumn: InfiniteTableColumn<Developer> = {
  renderGroupIcon: ({ rowInfo, toggleCurrentGroupRow }) => {
    return h(
      'div',
      {
        onClick: toggleCurrentGroupRow,
        style: { cursor: 'pointer', marginRight: '10px' },
      },
      rowInfo.isGroupRow ? (rowInfo.collapsed ? '👇' : '👉') : '',
    );
  },
};
</script>

<template>
  <DataSource :data="dataSource" primaryKey="id" :groupBy="groupBy">
    <InfiniteTable
      debugId="column-renderGroupIcon-example"
      :columns="columns"
      :groupColumn="groupColumn"
    />
  </DataSource>
</template>

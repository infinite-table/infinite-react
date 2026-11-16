<script setup lang="ts">
import { ref } from 'vue';
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import type {
  DataSourcePropGroupBy,
  InfiniteTablePropColumns,
  DataSourceProps,
} from '@infinite-table/infinite-vue';

const groupBy: DataSourcePropGroupBy<Developer> = [
  {
    field: 'stack',
  },
  {
    field: 'preferredLanguage',
  },
];

const domProps = {
  style: { flex: 1 },
};

const groupRowsState: DataSourceProps<Developer>['groupRowsState'] = {
  expandedRows: [],
  collapsedRows: true,
};

const columns: InfiniteTablePropColumns<Developer> = {
  country: {
    field: 'country',
  },
  firstName: { field: 'firstName' },
  age: { field: 'age' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  canDesign: { field: 'canDesign' },
  stack: { field: 'stack' },
};

const hideEmptyGroupColumns = ref(true);

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers10')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};
</script>

<template>
  <div
    :style="{
      display: 'flex',
      flex: 1,
      color: 'var(--infinite-cell-color)',
      flexFlow: 'column',
      background: 'var(--infinite-background)',
    }"
  >
    <div :style="{ padding: '10px' }">
      <label>
        <input type="checkbox" v-model="hideEmptyGroupColumns" />
        Hide Empty Group Columns (make sure all `Stack` groups are collapsed
        to see it in action). Try to expand the group column to see the new
        group column being added on-the-fly.
      </label>
    </div>
    <DataSource
      :data="dataSource"
      primaryKey="id"
      :defaultGroupRowsState="groupRowsState"
      :groupBy="groupBy"
    >
      <InfiniteTable
        debugId="hideEmptyGroupColumns-example"
        :domProps="domProps"
        :hideEmptyGroupColumns="hideEmptyGroupColumns"
        groupRenderStrategy="multi-column"
        :columns="columns"
        :columnDefaultWidth="250"
      />
    </DataSource>
  </div>
</template>

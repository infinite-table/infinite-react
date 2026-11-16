<script setup lang="ts">
import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
} from '@infinite-table/infinite-vue';
import type {
  InfiniteTableColumnAggregator,
  InfiniteTablePropColumns,
  DataSourcePropAggregationReducers,
  DataSourceGroupBy,
  DataSourcePivotBy,
  DataSourcePropSortInfo,
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
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const avgReducer: InfiniteTableColumnAggregator<Developer, any> = {
  initialValue: 0,
  field: 'salary',
  reducer: (acc, sum) => acc + sum,
  done: (sum, arr) => (arr.length ? sum / arr.length : 0),
};

const reducers: DataSourcePropAggregationReducers<Developer> = {
  salary: avgReducer,
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
  country: { field: 'country' },
  canDesign: { field: 'canDesign' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  age: { field: 'age' },
  salary: { field: 'salary', type: 'number' },
  currency: { field: 'currency' },
};

const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

const defaultSortInfo: DataSourcePropSortInfo<Developer> = [
  {
    id: 'group-by',
    dir: 1,
  },
];

const groupBy: DataSourceGroupBy<Developer>[] = [
  {
    field: 'preferredLanguage',
  },
  { field: 'stack' },
];

const pivotBy: DataSourcePivotBy<Developer>[] = [
  { field: 'country' },
  { field: 'canDesign' },
];

const pivotColumn = {
  defaultSortable: true,
};
</script>

<template>
  <DataSource
    primaryKey="id"
    :data="dataSource"
    :groupBy="groupBy"
    :pivotBy="pivotBy"
    :aggregationReducers="reducers"
    :defaultGroupRowsState="groupRowsState"
    :defaultSortInfo="defaultSortInfo"
  >
    <template #default="{ pivotColumns, pivotColumnGroups }">
      <InfiniteTable
        debugId="pivoting-sorting-example"
        :columns="columns"
        :pivotColumn="pivotColumn"
        :pivotColumns="pivotColumns"
        :pivotColumnGroups="pivotColumnGroups"
        :columnDefaultWidth="200"
        groupRenderStrategy="single-column"
        pivotTotalColumnPosition="end"
        multiSortBehavior="append"
      />
    </template>
  </DataSource>
</template>

<script setup lang="ts">
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import type {
  DataSourceGroupBy,
  DataSourcePivotBy,
  InfiniteTableColumnAggregator,
  DataSourcePropAggregationReducers,
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
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
};

const defaultGroupBy: DataSourceGroupBy<Developer>[] = [
  {
    field: 'country',
  },
  {
    field: 'city',
  },
];

const defaultPivotBy: DataSourcePivotBy<Developer>[] = [
  {
    field: 'stack',
  },
  {
    field: 'canDesign',
    columnGroup: ({ columnGroup }) => {
      return {
        ...columnGroup,
        header:
          columnGroup.pivotGroupKey === 'yes' ? 'Designer' : 'Non-designer',
      };
    },
  },
];

const avgReducer: InfiniteTableColumnAggregator<Developer, any> = {
  initialValue: 0,

  reducer: (acc, sum) => acc + sum,
  done: (sum, arr) => Math.round(arr.length ? sum / arr.length : 0),
};

const aggregations: DataSourcePropAggregationReducers<Developer> = {
  salary: {
    ...avgReducer,
    name: 'Salary (avg)',
    field: 'salary',
  },
  age: {
    ...avgReducer,
    name: 'Age (avg)',
    field: 'age',
  },
};
</script>

<template>
  <DataSource
    primaryKey="id"
    :defaultGroupBy="defaultGroupBy"
    :defaultPivotBy="defaultPivotBy"
    :aggregationReducers="aggregations"
    :data="dataSource"
  >
    <template #default="{ pivotColumns, pivotColumnGroups }">
      <InfiniteTable
        debugId="pivot-grand-total-column-position-example"
        groupRenderStrategy="single-column"
        :columns="columns"
        :columnDefaultWidth="200"
        :pivotColumns="pivotColumns"
        :pivotColumnGroups="pivotColumnGroups"
        pivotTotalColumnPosition="end"
        pivotGrandTotalColumnPosition="start"
      />
    </template>
  </DataSource>
</template>

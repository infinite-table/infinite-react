<script setup lang="ts">
import {
  DataSource,
  InfiniteTable,
  GroupRowsState,
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

const domProps = {
  style: {
    height: '80vh',
  },
};
const aggregationReducers: Record<string, any> = {
  salary: {
    name: 'Salary (avg)',
    field: 'salary',
    reducer: 'avg',
  },
  age: {
    name: 'Age (avg)',
    field: 'age',
    reducer: 'avg',
  },
};

const columns: Record<string, any> = {
  preferredLanguage: { field: 'preferredLanguage' },
  age: { field: 'age' },

  salary: {
    field: 'salary',
    type: 'number',
  },
  canDesign: { field: 'canDesign' },
  country: { field: 'country' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

const groupColumn = {
  id: 'group-col',
};

const columnPinning: Record<string, 'start' | 'end'> = {
  'group-col': 'start',
};

console.log('env var for tests', process.env.NEXT_PUBLIC_BASE_URL);

const groupBy = [
  {
    field: 'country' as keyof Developer,
  },
];

const lazyLoad = { batchSize: 5 };

const dataSource = ({
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
      ? 'pivotBy=' +
        JSON.stringify(pivotBy.map((p: any) => ({ field: p.field })))
      : null,
    `groupKeys=${JSON.stringify(groupKeys)}`,
    groupBy
      ? 'groupBy=' +
        JSON.stringify(groupBy.map((p: any) => ({ field: p.field })))
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
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL + `/developers30k-sql?` + args,
  ).then((r) => r.json());
};
</script>

<template>
  <DataSource
    primaryKey="id"
    :data="dataSource"
    :groupBy="groupBy"
    selectionMode="multi-row"
    :aggregationReducers="aggregationReducers"
    :defaultGroupRowsState="groupRowsState"
    :lazyLoad="lazyLoad"
  >
    <template v-slot="{ pivotColumns, pivotColumnGroups }">
      <InfiniteTable
        :domProps="domProps"
        :scrollStopDelay="10"
        :columnPinning="columnPinning"
        :columns="columns"
        :groupColumn="groupColumn"
        groupRenderStrategy="single-column"
        :columnDefaultWidth="220"
        :pivotColumns="pivotColumns"
        :pivotColumnGroups="pivotColumnGroups"
      />
    </template>
  </DataSource>
</template>

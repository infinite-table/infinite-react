<script setup lang="ts">
import {
  DataSource,
  InfiniteTable,
  defaultFilterFunction,
  defaultFilterTypes,
  multisort,
} from '@infinite-table/infinite-vue';
import type {
  DataSourcePropFilterValue,
  DataSourceSingleSortInfo,
  InfiniteTableColumn,
} from '@infinite-table/infinite-vue';
import { ref, shallowRef, watch } from 'vue';

type Developer = {
  id: number;
  firstName: string;
  country: string;
  stack: string;
  age: number;
};

const developers: Developer[] = [
  { id: 1, firstName: 'Bob', country: 'USA', stack: 'backend', age: 30 },
  { id: 2, firstName: 'Alice', country: 'France', stack: 'frontend', age: 25 },
  { id: 3, firstName: 'Carl', country: 'USA', stack: 'full-stack', age: 40 },
  { id: 4, firstName: 'Dana', country: 'France', stack: 'backend', age: 35 },
  { id: 5, firstName: 'Eve', country: 'Germany', stack: 'frontend', age: 28 },
  { id: 6, firstName: 'Frank', country: 'Germany', stack: 'backend', age: 45 },
];

// pretend this runs on a server: it filters and sorts the rows,
// with the same functions the DataSource uses
function fetchDevelopers(
  sortInfo: DataSourceSingleSortInfo<Developer>[],
  filterValue: DataSourcePropFilterValue<Developer>,
) {
  const filtered = developers.filter((data, index, dataArray) =>
    defaultFilterFunction({
      data,
      index,
      dataArray,
      primaryKey: data.id,
      filterValue,
      filterTypes: defaultFilterTypes,
    }),
  );
  const rows = multisort(sortInfo, filtered);

  return new Promise<Developer[]>((resolve) => {
    setTimeout(() => resolve(rows), 600);
  });
}

const columns: Record<string, InfiniteTableColumn<Developer>> = {
  firstName: { field: 'firstName', header: 'First name' },
  country: { field: 'country' },
  stack: { field: 'stack' },
  age: { field: 'age', type: 'number' },
};

const noRows: Developer[] = [];

const sortInfo = ref<DataSourceSingleSortInfo<Developer>[]>([]);
const filterValue = ref<DataSourcePropFilterValue<Developer>>([]);

const onSortInfoChange = (value: DataSourceSingleSortInfo<Developer>[]) => {
  sortInfo.value = value;
};
const onFilterValueChange = (value: DataSourcePropFilterValue<Developer>) => {
  filterValue.value = value;
};

const data = shallowRef<Developer[]>(noRows);
const isFetching = ref(false);

let lastRequestId = 0;

// every change of the sorting or of the filtering loads the rows again
watch(
  [sortInfo, filterValue],
  () => {
    const requestId = ++lastRequestId;

    isFetching.value = true;

    fetchDevelopers(sortInfo.value, filterValue.value).then((rows) => {
      if (requestId !== lastRequestId) {
        // the sorting or the filtering has changed again in the meantime
        return;
      }
      // the previous rows stay on screen until the new ones arrive
      data.value = rows;
      isFetching.value = false;
    });
  },
  { immediate: true },
);

const shouldReloadData = { sortInfo: true, filterValue: true };
</script>

<template>
  <p :style="{ color: 'var(--infinite-cell-color)' }">
    {{ isFetching ? 'Loading...' : 'Sort or filter a column' }}
  </p>
  <DataSource
    primaryKey="id"
    :data="data"
    :sortInfo="sortInfo"
    :onSortInfoChange="onSortInfoChange"
    :filterValue="filterValue"
    :onFilterValueChange="onFilterValueChange"
    :shouldReloadData="shouldReloadData"
  >
    <InfiniteTable :columns="columns" :showColumnFilters="true" />
  </DataSource>
</template>

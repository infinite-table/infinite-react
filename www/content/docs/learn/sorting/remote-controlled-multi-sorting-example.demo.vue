<script setup lang="ts">
import { ref } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import type {
  DataSourceData,
  DataSourcePropSortInfo,
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

const dataSource: DataSourceData<Developer> = ({ sortInfo }) => {
  if (sortInfo && !Array.isArray(sortInfo)) {
    sortInfo = [sortInfo];
  }
  const args = [
    sortInfo
      ? 'sortInfo=' +
        JSON.stringify(
          sortInfo.map((s) => ({
            field: s.field,
            dir: s.dir,
          })),
        )
      : null,
  ]
    .filter(Boolean)
    .join('&');

  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers100-sql?` + args)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  preferredLanguage: { field: 'preferredLanguage' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  age: { field: 'age' },
  canDesign: { field: 'canDesign' },
  country: { field: 'country' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

// #highlight controlled: the sort lives in a ref, updated in onSortInfoChange
const sortInfo = ref<DataSourcePropSortInfo<Developer>>([
  {
    field: 'salary',
    dir: -1,
  },
]);

const onSortInfoChange = (value: DataSourcePropSortInfo<Developer>) => {
  sortInfo.value = value;
};
// #endhighlight

const shouldReloadData = {
  sortInfo: true,
};
</script>

<template>
  <DataSource
    primaryKey="id"
    :data="dataSource"
    :sortInfo="sortInfo"
    :shouldReloadData="shouldReloadData"
    :onSortInfoChange="onSortInfoChange"
  >
    <InfiniteTable
      debugId="remote-controlled-multi-sorting-example"
      :columns="columns"
      :columnDefaultWidth="220"
    />
  </DataSource>
</template>

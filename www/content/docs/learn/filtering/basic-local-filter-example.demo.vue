<script setup lang="ts">
import {
  InfiniteTable,
  DataSource,
  defaultFilterTypes,
} from '@infinite-table/infinite-vue';
import type {
  DataSourceData,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  salary: number;
};

defaultFilterTypes.string.operators.push({
  name: 'Not includes',
  label: 'Not Includes',
  fn: ({ currentValue, filterValue, emptyValues }) => {
    if (
      emptyValues.includes(currentValue) ||
      emptyValues.includes(filterValue)
    ) {
      return true;
    }
    return (
      typeof currentValue === 'string' &&
      typeof filterValue == 'string' &&
      !currentValue.toLowerCase().includes(filterValue.toLowerCase())
    );
  },
});

const data: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql?`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    type: 'number',
    defaultWidth: 70,
    defaultFilterable: false,
  },
  salary: {
    field: 'salary',
    type: 'number',
  },

  firstName: {
    field: 'firstName',
  },
  stack: { field: 'stack' },
  currency: { field: 'currency' },
};

const domProps = {
  style: {
    height: '100%',
  },
};
</script>

<template>
  <DataSource
    :data="data"
    primaryKey="id"
    :defaultFilterValue="[]"
    :filterDelay="0"
  >
    <InfiniteTable
      debugId="basic-local-filter-example"
      :domProps="domProps"
      :columnDefaultWidth="150"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>

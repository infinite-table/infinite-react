<script setup lang="ts">
import {
  DataSource,
  InfiniteTable,
  StringFilterEditor,
} from '@infinite-table/infinite-vue';

import { dataSource } from './custom-filter-type.data';

const columns: Record<string, any> = {
  firstName: {
    field: 'firstName',
    header: 'First Name',
  },
  country: {
    field: 'country',
    header: 'Country',
    filterType: 'country',
  },
};

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

const aliases: Record<string, string> = {
  usa: 'United States',
  it: 'Italy',
};

const filterTypes = {
  country: {
    label: 'Country',
    emptyValues: [''],
    defaultOperator: 'same',
    operators: [
      {
        name: 'same',
        fn: ({ currentValue, filterValue, emptyValues }: any) => {
          if (
            emptyValues.includes(currentValue) ||
            emptyValues.includes(filterValue)
          ) {
            return true;
          }

          return (
            currentValue === filterValue ||
            aliases[currentValue] === filterValue
          );
        },
      },
    ],
  },
};

const columnTypes = {
  country: {
    components: {
      FilterEditor: StringFilterEditor,
    },
  },
};

const defaultFilterValue: any[] = [];

const shouldReloadData = {
  filterValue: false,
};
</script>

<template>
  <DataSource
    :data="dataSource"
    primaryKey="id"
    :defaultFilterValue="defaultFilterValue"
    :filterTypes="filterTypes"
    :shouldReloadData="shouldReloadData"
    :filterDelay="0"
  >
    <InfiniteTable
      :columnTypes="columnTypes"
      :domProps="domProps"
      :columnDefaultWidth="150"
      :columns="columns"
    />
  </DataSource>
</template>

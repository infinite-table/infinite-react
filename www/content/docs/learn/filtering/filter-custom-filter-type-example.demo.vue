<script setup lang="ts">
import { h } from 'vue';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import type {
  DataSourceData,
  DataSourcePropFilterTypes,
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

const data: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql?`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    type: 'number',
    defaultWidth: 100,
  },
  salary: {
    defaultFilterable: true,
    field: 'salary',
    type: 'number',
    filterType: 'salary',
  },

  firstName: {
    field: 'firstName',
  },
  stack: { field: 'stack' },
  currency: { field: 'currency', defaultFilterable: false },
};

function getIcon(icon: string) {
  return () =>
    h(
      'div',
      {
        style: {
          width: '20px',
          display: 'flex',
          justifyContent: 'center',
          flexFlow: 'row',
        },
      },
      icon,
    );
}

const filterTypes: DataSourcePropFilterTypes<Developer> = {
  salary: {
    defaultOperator: 'gt',
    emptyValues: ['', null, undefined],
    operators: [
      {
        name: 'gt',
        label: 'Greater Than',
        components: {
          Icon: getIcon('>'),
        },
        fn: ({ currentValue, filterValue }) => {
          return currentValue > filterValue;
        },
      },
      {
        name: 'gte',
        components: {
          Icon: getIcon('>='),
        },
        label: 'Greater Than or Equal',
        fn: ({ currentValue, filterValue }) => {
          return currentValue >= filterValue;
        },
      },
      {
        name: 'lt',
        components: {
          Icon: getIcon('<'),
        },
        label: 'Less Than',
        fn: ({ currentValue, filterValue }) => {
          return currentValue < filterValue;
        },
      },
      {
        name: 'lte',
        components: {
          Icon: getIcon('<='),
        },
        label: 'Less Than or Equal',
        fn: ({ currentValue, filterValue }) => {
          return currentValue <= filterValue;
        },
      },
    ],
  },
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
    :filterTypes="filterTypes"
  >
    <InfiniteTable
      debugId="filter-custom-filter-type-example"
      :domProps="domProps"
      :columnDefaultWidth="150"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>

<script setup lang="ts">
import sinon from 'sinon';

import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
} from '@infinite-table/infinite-vue';

import type {
  DataSourceData,
  InfiniteTablePropColumns,
  DataSourceGroupBy,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  stack: string;
};

const dataPerKey: Record<string, any> = {
  '': [
    {
      data: { country: 'USA' },
      keys: ['USA'],
    },
    {
      data: { country: 'Germany' },
      keys: ['Germany'],
    },
  ],
  USA: [
    {
      data: { stack: 'frontend', country: 'USA' },
      keys: ['USA', 'frontend'],

      dataset: {
        cache: true,
        data: [
          { id: 1, firstName: 'John', country: 'USA', stack: 'frontend' },
          { id: 2, firstName: 'Marry', country: 'USA', stack: 'frontend' },
        ],
        totalCount: 2,
      },
    },
    {
      data: { stack: 'backend', country: 'USA' },
      keys: ['USA', 'backend'],
    },
    {
      data: { stack: 'fullstack', country: 'USA' },
      keys: ['USA', 'fullstack'],
    },
  ],
  Germany: [
    {
      data: { stack: 'fullstack', country: 'Germany' },
      keys: ['Germany', 'fullstack'],
    },
  ],
  'Germany,fullstack': [
    { id: 9, firstName: 'Johanna', country: 'Germany', stack: 'fullstack' },
    { id: 10, firstName: 'Dietrich', country: 'Germany', stack: 'fullstack' },
    { id: 11, firstName: 'Dobrich', country: 'Germany', stack: 'fullstack' },
  ],
  'USA,frontend': [
    { id: 1, firstName: 'John', country: 'USA', stack: 'frontend' },
    { id: 2, firstName: 'Marry', country: 'USA', stack: 'frontend' },
  ],
  'USA,backend': [
    { id: 3, firstName: 'Bob', country: 'USA', stack: 'backend' },
    { id: 4, firstName: 'Bill', country: 'USA', stack: 'backend' },
    { id: 5, firstName: 'James', country: 'USA', stack: 'backend' },
  ],
  'USA,fullstack': [
    { id: 6, firstName: 'Mark', country: 'USA', stack: 'fullstack' },
    { id: 7, firstName: 'Robby', country: 'USA', stack: 'fullstack' },
    { id: 8, firstName: 'Maryann', country: 'USA', stack: 'fullstack' },
  ],
};

dataPerKey[''][0].dataset = {
  data: dataPerKey['USA'],
  totalCount: dataPerKey['USA'].length,
  cache: true,
};

const columns: InfiniteTablePropColumns<Developer> = {
  country: { field: 'country' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
};

const groupRowsState = new GroupRowsState({
  expandedRows: [['USA'], ['USA', 'frontend']],
  collapsedRows: true,
});

const groupBy: DataSourceGroupBy<Developer>[] = [
  {
    field: 'country',
  },

  { field: 'stack' },
];

const dataSource: DataSourceData<Developer> = sinon.spy(
  ({ groupKeys }: { groupKeys: string[] }) => {
    console.log('resolve data for groupKeys', groupKeys);
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = dataPerKey[(groupKeys || []).join(',')];

        const response = {
          data,
          totalCount: data.length,
        };

        console.log('response', response);
        resolve(response);
      }, 10);
    });
  },
);

(globalThis as any).dataSource = dataSource;

const domProps = {
  style: {
    height: '80vh',
  },
};
</script>

<template>
  <DataSource
    primaryKey="id"
    :data="dataSource"
    :groupBy="groupBy"
    :defaultGroupRowsState="groupRowsState"
    :lazyLoad="true"
  >
    <InfiniteTable
      :domProps="domProps"
      :scrollStopDelay="10"
      :columns="columns"
      :columnDefaultWidth="220"
    />
  </DataSource>
</template>

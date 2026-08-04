<script setup lang="ts">
import { h } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type {
  InfiniteTablePropColumns,
  DataSourceData,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
};

const dataSource: DataSourceData<Developer> = ({}) => {
  return [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Bobson',
      country: 'USA',
      city: 'LA',
      currency: 'USD',
    },
    {
      id: 2,
      firstName: 'Bill',
      lastName: 'Richardson',
      country: 'USA',
      city: 'NY',
      currency: 'USD',
    },
    {
      id: 3,
      firstName: 'Nat',
      lastName: 'Natson',
      country: 'Canada',
      city: 'Montreal',
      currency: 'CAD',
    },
  ];
};

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: {
    field: 'firstName',
    defaultWidth: 200,
  },
  city: {
    field: 'city',
  },

  currency: {
    field: 'currency',
    renderGroupValue: ({ rowInfo }: any) => {
      return rowInfo.value;
    },
  },
  country: {
    field: 'country',
    renderGroupValue: ({ rowInfo }: any) => {
      return `Group: ${rowInfo.value}`;
    },
    renderLeafValue: ({ value }: any) => {
      return `Country: ${value}`;
    },
    render: ({ renderBag }: any) => {
      return h('button', [renderBag.value]);
    },
  },
};

const defaultGroupRowsState = {
  expandedRows: true as const,
  collapsedRows: [],
};

const groupBy = [
  {
    field: 'country' as const,
    column: {
      renderGroupIcon: ({ renderBag }: any) => {
        return h('button', [renderBag.groupIcon]);
      },
    },
  },
];

const domProps = {
  style: {
    margin: '5px',
    height: '500px',
    width: '1000px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};
</script>

<template>
  <DataSource
    :data="dataSource"
    primaryKey="id"
    :defaultGroupRowsState="defaultGroupRowsState"
    :groupBy="groupBy"
  >
    <InfiniteTable
      :domProps="domProps"
      :columnDefaultWidth="180"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>

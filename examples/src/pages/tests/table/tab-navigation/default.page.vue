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

const dataSource: DataSourceData<Developer> = () => {
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
    {
      id: 4,
      firstName: 'Nadia',
      lastName: 'Maty',
      country: 'Canada',
      city: 'Quebec',
      currency: 'CAD',
    },
    {
      id: 5,
      firstName: 'Rich',
      lastName: 'Bobyard',
      country: 'USA',
      city: 'LA',
      currency: 'USD',
    },
    {
      id: 6,
      firstName: 'Hillary',
      lastName: 'Markinson',
      country: 'USA',
      city: 'NY',
      currency: 'USD',
    },
    {
      id: 7,
      firstName: 'Nat',
      lastName: 'Medson',
      country: 'Canada',
      city: 'Montreal',
      currency: 'CAD',
    },
    {
      id: 8,
      firstName: 'Joseph',
      lastName: 'Maty',
      country: 'Canada',
      city: 'Quebec',
      currency: 'CAD',
    },

    {
      id: 9,
      firstName: 'Michaela',
      lastName: 'Albertson',
      country: 'USA',
      city: 'LA',
      currency: 'USD',
    },
  ];
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 380 },
  country: {
    field: 'country',
    contentFocusable: true,
    renderValue: ({ rowIndex }: { rowIndex: number }) =>
      h('input', { name: 'country', type: 'text', value: `${rowIndex}-country` }),
  },
  firstName: {
    field: 'firstName',
  },
  preferredLanguage: {
    field: 'currency',
    // editable: () => true,
    contentFocusable: true,
    renderValue: ({ rowIndex }: { rowIndex: number }) =>
      h('input', {
        name: 'currency',
        type: 'text',
        value: `${rowIndex}-currency`,
      }),
  },
};

const onSelfFocus = () => {
  // console.log('onSelfFocus');
};

const onReady = ({ api }: { api: any }) => {
  (globalThis as any).infiniteApi = api;
};

const domProps = {
  style: {
    margin: '10px',
    height: '150px',
  },
};
</script>

<template>
  <div>
    <input type="text" value="John" />
  </div>
  <DataSource primaryKey="id" :data="dataSource">
    <InfiniteTable
      :columns="columns"
      :columnDefaultWidth="500"
      keyboardNavigation="cell"
      :onSelfFocus="onSelfFocus"
      :onReady="onReady"
      :domProps="domProps"
    />
  </DataSource>
  <div>
    <input type="text" value="Patrick" />
  </div>
</template>

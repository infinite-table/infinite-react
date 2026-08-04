<script setup lang="ts">
import { defineComponent, h } from 'vue';

import {
  InfiniteTable,
  DataSource,
  useInfiniteColumnCell,
} from '@infinite-table/infinite-vue';

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
  ];
};

const CountryComponent = defineComponent({
  inheritAttrs: false,
  setup(_props, { attrs }) {
    const cellCtx = useInfiniteColumnCell<Developer>();

    return () => {
      const ctx = cellCtx.value;
      const { domRef, renderBag } = ctx;

      return h(
        'div',
        {
          ...attrs,
          style: [{ padding: '5px 20px' }, attrs.style as any],
          ref: domRef as any,
        },
        ['START:', renderBag.value as any, '!END'],
      );
    };
  },
});

const Country = defineComponent({
  setup() {
    const cellCtx = useInfiniteColumnCell<Developer>();
    console.log('renderBag');
    return () => ['Country: ', cellCtx.value.renderBag.value as any];
  },
});

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 80 },
  country: {
    field: 'country',
    renderValue: () => h(Country),
    defaultWidth: 250,
    components: {
      ColumnCell: CountryComponent as any,
    },
  },
  firstName: {
    field: 'firstName',
  },
  preferredLanguage: {
    field: 'currency',
  },
};

const domProps = {
  style: {
    height: '500px',
  },
};
</script>

<template>
  <DataSource primaryKey="id" :data="dataSource">
    <InfiniteTable :columns="columns" :domProps="domProps" />
  </DataSource>
</template>

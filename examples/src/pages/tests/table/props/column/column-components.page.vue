<script setup lang="ts">
import { defineComponent, h } from 'vue';

import {
  InfiniteTable,
  DataSource,
  useInfiniteColumnCell,
  useInfiniteHeaderCell,
} from '@infinite-table/infinite-vue';

import type {
  InfiniteTablePropColumns,
  InfiniteTablePropColumnTypes,
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

const DefaultHeaderComponent = defineComponent({
  inheritAttrs: false,
  setup(_props, { attrs }) {
    const headerCtx = useInfiniteHeaderCell<Developer>();

    return () => {
      const ctx = headerCtx.value;
      const { column, domRef, columnSortInfo } = ctx;

      let sortTool = '';
      switch (columnSortInfo?.dir) {
        case undefined:
          sortTool = '👉';
          break;
        case 1:
          sortTool = '👇';
          break;
        case -1:
          sortTool = '👆';
          break;
      }

      return h(
        'div',
        {
          ...attrs,
          style: [attrs.style as any, { border: '1px solid #fefefe' }],
          ref: domRef as any,
        },
        // here you would usually have the default children + sortTool,
        // but in this case we want to override the default sort tool as well
        `${column.field} ${sortTool}`,
      );
    };
  },
});

const CountryComponent = defineComponent({
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    const cellCtx = useInfiniteColumnCell<Developer>();

    return () => {
      const ctx = cellCtx.value;
      const { value, domRef, renderBag } = ctx;

      const isUSA = value === 'USA';
      const emoji = isUSA ? '- UNITED STATES' : '- CANADA';

      return h(
        'div',
        {
          ...attrs,
          style: [
            {
              padding: '5px 20px',
              border: `1px solid ${isUSA ? 'red' : 'green'}`,
            },
            attrs.style as any,
          ],
          ref: domRef as any,
        },
        [
          // we want to make sure the value in the renderBag is correctly used
          slots.default ? slots.default() : null,
          '!',
          renderBag.value as any,
          '!',
          emoji,
          ' ',
          h('div', { style: { flex: 1 } }),
        ],
      );
    };
  },
});

const columnTypes: InfiniteTablePropColumnTypes<Developer> = {
  default: {
    // override all columns to use these components
    components: {
      HeaderCell: DefaultHeaderComponent as any,
    },
  },
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 80 },
  country: {
    field: 'country',
    renderValue: ({ data }) => 'Country: ' + data?.country,
    components: {
      HeaderCell: DefaultHeaderComponent as any,
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
    <InfiniteTable
      :columns="columns"
      :columnDefaultWidth="500"
      :columnTypes="columnTypes"
      :domProps="domProps"
    />
  </DataSource>
</template>

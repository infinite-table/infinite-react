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

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const DefaultHeaderComponent = defineComponent({
  inheritAttrs: false,
  setup(_props, { attrs }) {
    const headerCell = useInfiniteHeaderCell<Developer>();

    return () => {
      const { column, columnSortInfo } = headerCell.value;

      const style = [attrs.style, { border: '1px solid #fefefe' }];

      let sortTool = '';
      switch (columnSortInfo?.dir) {
        case undefined:
          sortTool = '👉';
          break;
        case 1:
          sortTool = '👇';
          break;
        case -1:
          sortTool = '☝🏽';
          break;
      }

      // here you would usually have:
      // [slots.default?.(), ' ', sortTool]
      // but in this case we want to override the default sort tool as well (which is part of the default slot)
      return h('div', { ...attrs, style }, `${column.field} ${sortTool}`);
    };
  },
});

const StackComponent = defineComponent({
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    const cell = useInfiniteColumnCell<Developer>();

    return () => {
      const { value } = cell.value;

      const isFrontEnd = value === 'frontend';
      const emoji = isFrontEnd ? '⚛️' : '💽';
      const style = [
        {
          padding: '5px 20px',
          border: `1px solid ${isFrontEnd ? 'red' : 'green'}`,
        },
        attrs.style,
      ];
      return h('div', { ...attrs, style }, [
        slots.default?.(),
        ' ',
        h('div', { style: { flex: 1 } }),
        ' ',
        emoji,
      ]);
    };
  },
});

const columnTypes: InfiniteTablePropColumnTypes<Developer> = {
  default: {
    // override all columns to use these components
    components: {
      HeaderCell: DefaultHeaderComponent,
    },
  },
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 80 },
  stack: {
    field: 'stack',
    renderValue: ({ data }) => 'Stack: ' + data?.stack,
    components: {
      HeaderCell: DefaultHeaderComponent,
      ColumnCell: StackComponent,
    },
  },
  firstName: {
    field: 'firstName',
  },
  preferredLanguage: {
    field: 'preferredLanguage',
  },
};
</script>

<template>
  <DataSource primaryKey="id" :data="dataSource">
    <InfiniteTable
      debugId="column-components-example"
      :columns="columns"
      :columnTypes="columnTypes"
    />
  </DataSource>
</template>

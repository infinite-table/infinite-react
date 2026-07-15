<script setup lang="ts">
import { h } from 'vue';

import {
  DataSource,
  InfiniteTable,
  components,
} from '@infinite-table/infinite-vue';

import { data } from './people';

const { MenuIcon } = components;

const columns: Record<string, any> = {
  name: {
    field: 'name',
    header: 'NAME - TEST USES THIS COLUMN',
    renderMenuIcon: ({ renderBag }: { renderBag: any }) => {
      return h(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'row',
            color: 'red',
          },
          'data-name': 'test-icon',
        },
        ['x', renderBag.menuIcon],
      );
    },
  },
  department: {
    field: 'department',
    style: {
      color: 'red',
    },
    renderMenuIcon: ({ renderBag }: { renderBag: any }) => {
      return renderBag.menuIcon;
    },
  },

  team: {
    field: 'team',
    renderMenuIcon: ({ renderBag }: { renderBag: any }) => {
      return h(MenuIcon, { ...renderBag.menuIconProps });
    },
  },
};

const groupBy = [
  {
    field: 'department' as const,
  },
  { field: 'team' as const, column: { field: 'team' as const } },
];

const slicedData = data.slice(0, 5);

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};
</script>

<template>
  <DataSource :data="slicedData" primaryKey="id" :groupBy="groupBy">
    <InfiniteTable
      :domProps="domProps"
      :defaultActiveRowIndex="0"
      :columnDefaultWidth="250"
      :columns="columns"
    />
  </DataSource>
</template>

<script setup lang="ts">
import { h } from 'vue';
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import type {
  InfiniteTablePropColumns,
  InfiniteTablePropGetColumnMenuItems,
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

const columns: InfiniteTablePropColumns<Developer> = {
  currency: {
    field: 'currency',

    // custom menu icon
    renderMenuIcon: () => h('div', '🌎'),
  },

  preferredLanguage: {
    field: 'preferredLanguage',
    defaultWidth: 350,
    header: ({ columnApi, renderLocation }) => {
      // if we're inside the column menu with all columns, return only the col name
      if (renderLocation === 'column-menu') {
        return 'Preferred Language';
      }

      // but for the real column header
      // return this custom content
      return [
        'Preferred Language ',
        h(
          'button',
          {
            // we need to stop propagation so we don't trigger a sort when this button is clicked
            onPointerdown: (e: PointerEvent) => e.stopPropagation(),
            onMousedown: (e: MouseEvent) => {
              // again, stop propagation so the menu is not closed automatically
              // so we can control it in the line below
              e.stopPropagation();

              columnApi.toggleContextMenu(e.target!);
            },
            style: { border: '1px solid magenta', margin: '2px' },
          },
          'Toggle menu',
        ),
      ];
    },

    // custom menu icon
    renderMenuIcon: () => h('div', '🌎'),
  },
  salary: {
    field: 'salary',
    // hide the menu icon
    renderMenuIcon: false,
  },
  country: {
    field: 'country',
  },
  id: { field: 'id', defaultWidth: 80, renderMenuIcon: false },
  firstName: {
    field: 'firstName',
  },
};

const getColumnMenuItems: InfiniteTablePropGetColumnMenuItems<Developer> = (
  items,
  { column },
) => {
  if (column.id === 'firstName') {
    // you can adjust the default items for a specific column
    items.splice(0, 0, {
      key: 'firstName',
      label: 'First name menu item',
      onAction: () => {
        console.log('Hey there!');
      },
    });
  }

  items.push(
    {
      key: 'hello',
      label: 'Hello World',
      onAction: () => {
        alert('Hello World from column ' + column.id);
      },
    },
    {
      key: 'translate',
      label: 'Translate',
      menu: {
        items: [
          {
            key: 'translateToEnglish',
            label: 'English',
            onAction: () => {
              console.log('Translate to English');
            },
          },
          {
            key: 'translateToFrench',
            label: 'French',
            onAction: () => {
              console.log('Translate to French');
            },
          },
        ],
      },
    },
  );
  return items;
};
</script>

<template>
  <DataSource primaryKey="id" :data="dataSource">
    <InfiniteTable
      debugId="getColumnMenuItems-example"
      :columnHeaderHeight="70"
      :columns="columns"
      :getColumnMenuItems="getColumnMenuItems"
    />
  </DataSource>
</template>

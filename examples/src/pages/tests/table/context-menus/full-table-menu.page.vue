<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

type Developer = {
  id: number;

  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  age: number;
};

const data: Developer[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Bob',
    age: 20,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 2,
    firstName: 'Marry',
    lastName: 'Bob',
    age: 25,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 3,
    firstName: 'Bill',
    lastName: 'Bobson',
    age: 30,
    canDesign: 'no',
    currency: 'CAD',
    preferredLanguage: 'TypeScript',
    stack: 'frontend',
  },
  {
    id: 4,
    firstName: 'Mark',
    lastName: 'Twain',
    age: 31,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Rust',
    stack: 'backend',
  },
  {
    id: 5,
    firstName: 'Matthew',
    lastName: 'Hilson',
    age: 29,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Go',
    stack: 'backend',
  },
];

const columns: Record<string, any> = {
  firstName: {
    field: 'firstName',
  },
  age: {
    field: 'age',
    type: 'number',
  },

  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
};

const getContextMenuItems = (
  { column, value }: { column?: any; value?: any },
  { api }: { api: any },
) => {
  if (!column) {
    return [
      {
        label: `Generic menu item persistent`,
        key: 'generic1',
      },
      {
        label: `Generic menu item hide via arg call`,
        key: 'generic-arg',
        onAction: ({ hideMenu }: { hideMenu: () => void }) => {
          hideMenu();
        },
      },
      {
        label: `Generic menu hides via api call`,
        key: 'generic2',
        onAction: () => {
          api.hideContextMenu();
        },
      },
      {
        label: `Generic menu item with item.autohide`,
        key: 'generic3',
        hideMenuOnAction: true,

        menu: {
          items: [
            {
              label: `Generic menu item with item.autohide - subitem`,
              key: 'generic4',
              hideMenuOnAction: true,

              menu: {
                onHideIntent: () => {
                  console.log('onHideIntent submenu for generic4');
                },
                onHide: () => {
                  console.log('onHide submenu for generic4');
                },
                items: [
                  {
                    label: `Generic menu item with item.autohide - subitem - subitem`,
                    key: 'generic5',
                    hideMenuOnAction: true,
                  },
                ],
              },
            },
          ],
        },
      },
    ];
  }

  return [
    {
      label: `hi ${value}`,
      key: `col:${column.id}`,
    },
  ];
};

const onCellContextMenu = () => {};

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
  <DataSource :data="data" primaryKey="id">
    <InfiniteTable
      :domProps="domProps"
      :getContextMenuItems="getContextMenuItems"
      :columnDefaultWidth="100"
      :columnMinWidth="50"
      :columns="columns"
      :onCellContextMenu="onCellContextMenu"
    />
  </DataSource>
</template>

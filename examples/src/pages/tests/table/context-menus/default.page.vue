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
  noMenu: { renderValue: () => 'no cell context menu', header: 'No Menu' },
};

const getCellContextMenuItems = ({
  column,
  value,
}: {
  column: any;
  value: any;
}) => {
  if (column.id === 'currency') {
    return [
      {
        label: `Currency ${value}`,
        key: 'money',
        onClick: () => {
          // alert('clicked');
        },
      },
      {
        label: `Currency ${value} - item 2`,
        key: 'money2',
      },
    ];
  }
  if (column.id === 'age') {
    return [];
  }
  if (column.id === 'noMenu') {
    return null;
  }
  return [
    {
      label: `hi ${value}`,
      key: 'hi',
    },
    {
      label: `hi ${value} - item 2`,
      key: 'hi2',
    },
  ];
};

const defaultFilterValue: any[] = [];

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
    :data="data"
    primaryKey="id"
    :defaultFilterValue="defaultFilterValue"
  >
    <InfiniteTable
      :domProps="domProps"
      :getCellContextMenuItems="getCellContextMenuItems"
      :columnDefaultWidth="100"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>

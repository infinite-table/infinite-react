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

const getCellContextMenuItems = ({
  column,
  value,
  rowInfo,
}: {
  column: any;
  value: any;
  rowInfo: any;
}) => {
  if (column.id === 'currency') {
    return {
      columns: [{ name: 'id' }, { name: 'label' }, { name: 'cellValue' }],
      items: [
        {
          id: `${rowInfo.id}`,
          label: `Currency ${value}`,
          key: 'money',
          cellValue: value,
        },
        {
          id: `${rowInfo.id}`,
          label: `Currency ${value} - item 2`,
          key: 'money2',
          cellValue: value + '!',
        },
      ],
    };
  }
  if (column.id === 'age') {
    return [];
  }
  return [
    {
      label: `hi ${value}`,
      key: 'hi',
    },
  ];
};

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
      :getCellContextMenuItems="getCellContextMenuItems"
      :columnDefaultWidth="100"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>

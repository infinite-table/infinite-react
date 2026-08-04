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
    renderSelectionCheckBox: true,
    style: {
      color: 'red',
      textDecoration: 'underline',
    },
    renderLeafValue: ({ value }: { value: any }) => {
      return `${value}!`;
    },
  },
  lastName: {
    field: 'lastName',
  },
  stack: {
    field: 'stack',
    renderValue: ({ value }: { value: any }) => {
      return `${value || ''}.`;
    },
  },
  preferredLanguage: {
    field: 'preferredLanguage',

    renderValue: ({ value }: { value: any }) => {
      return `${value || ''}?`;
    },
    style: {
      color: 'green',
      fontSize: '24px',
    },
  },
  age: {
    field: 'age',
  },
  canDesign: {
    field: 'canDesign',
  },
};
const domProps = {
  style: {
    height: '80vh',
  },
};

const groupBy = [
  { field: 'stack' as const },
  { field: 'preferredLanguage' as const },
];

const groupColumn = {
  field: 'firstName' as const,
  style: {
    textDecoration: 'line-through',
    fontWeight: 'bold',
    fontSize: '16px',
  },
};
</script>

<template>
  <DataSource primaryKey="id" :data="data" :groupBy="groupBy">
    <InfiniteTable
      :domProps="domProps"
      :groupColumn="groupColumn"
      groupRenderStrategy="single-column"
      :columns="columns"
      :columnDefaultWidth="200"
    />
  </DataSource>
</template>

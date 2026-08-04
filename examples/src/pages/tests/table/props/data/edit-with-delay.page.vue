<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { type Developer as BaseDeveloper, height100DomProps } from './common';

type Developer = BaseDeveloper & { salary: string };

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
    salary: '$ 1000',
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
    salary: '$ 11000',
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
    salary: '$ 12000',
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
    salary: '£ 21000',
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
    salary: '£ 9000',
  },
];

const columns: Record<string, any> = {
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
    defaultEditable: (params: { rawValue: any }) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(params.rawValue !== 'John');
        }, 1000);
      });
    },
  },
  age: {
    field: 'age',
    type: 'number',
  },
  salary: {
    field: 'salary',
  },

  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
};

</script>

<template>
  <DataSource :data="data" primaryKey="id">
    <InfiniteTable
      :domProps="height100DomProps"
      keyboardNavigation="cell"
      :columnDefaultEditable="true"
      :columnDefaultWidth="150"
      :columns="columns"
    />
  </DataSource>
</template>

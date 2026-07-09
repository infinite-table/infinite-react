<script setup lang="ts">
import sinon from 'sinon';

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
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
  },
  age: {
    field: 'age',
    type: 'number',
    defaultEditable: false,
  },
  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
};

const onEditCancelled = sinon.spy(() => {});
const onEditAccepted = sinon.spy(() => {});
const onEditPersistError = sinon.spy(() => {});
const onEditPersistSuccess = sinon.spy(() => {});

(globalThis as any).onEditCancelled = onEditCancelled;
(globalThis as any).onEditAccepted = onEditAccepted;
(globalThis as any).onEditPersistError = onEditPersistError;
(globalThis as any).onEditPersistSuccess = onEditPersistSuccess;

const persistEdit = ({
  value,
  dataSourceApi,
  data,
  column,
}: {
  value: any;
  dataSourceApi: any;
  data: any;
  column: any;
}) => {
  if (column.id === 'id') {
    return new Error('Cannot edit id');
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        dataSourceApi.updateData({
          ...data,
          [column.field!]: value + '!',
        }),
      );
    }, 200);
  });
};

const domProps = {
  style: {
    height: '100%',
  },
};
</script>

<template>
  <DataSource :data="data" primaryKey="id">
    <InfiniteTable
      :domProps="domProps"
      :onEditCancelled="onEditCancelled"
      :onEditAccepted="onEditAccepted"
      :onEditPersistError="onEditPersistError"
      :onEditPersistSuccess="onEditPersistSuccess"
      :persistEdit="persistEdit"
      :columnDefaultEditable="true"
      :columnDefaultWidth="150"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>

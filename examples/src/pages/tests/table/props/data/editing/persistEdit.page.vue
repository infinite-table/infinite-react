<script setup lang="ts">
import sinon from 'sinon';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import {
  type Developer,
  data,
  height100DomProps,
} from './common';

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

</script>

<template>
  <DataSource :data="data" primaryKey="id">
    <InfiniteTable
      :domProps="height100DomProps"
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

<script setup lang="ts">
import sinon from 'sinon';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { type Developer, data as baseData, height100DomProps } from './common';

const data: Developer[] = [{ ...baseData[0], currency: 'USDx' }, ...baseData.slice(1)];

const columns: Record<string, any> = {
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
    style: ({ inEdit }: { inEdit: boolean }) => {
      return inEdit
        ? {
            fontSize: '30px',
          }
        : {};
    },
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
const onEditRejected = sinon.spy(() => {});
const onEditAccepted = sinon.spy(() => {});

(globalThis as any).onEditCancelled = onEditCancelled;
(globalThis as any).onEditAccepted = onEditAccepted;
(globalThis as any).onEditRejected = onEditRejected;

const shouldAcceptEdit = ({ column }: { column: any }) => {
  if (column.id === 'id') {
    return false;
  }
  if (column.id === 'currency') {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(false);
      }, 200);
    });
  }
  if (column.id === 'firstName') {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 200);
    });
  }
  return true;
};

</script>

<template>
  <DataSource :data="data" primaryKey="id">
    <InfiniteTable
      :domProps="height100DomProps"
      :shouldAcceptEdit="shouldAcceptEdit"
      :onEditCancelled="onEditCancelled"
      :onEditAccepted="onEditAccepted"
      :onEditRejected="onEditRejected"
      :columnDefaultEditable="true"
      :columnDefaultWidth="150"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>

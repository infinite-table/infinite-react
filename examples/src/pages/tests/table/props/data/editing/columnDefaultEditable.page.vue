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
    defaultEditable: false,
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
const onEditAccepted = sinon.spy(() => {});

(globalThis as any).onEditCancelled = onEditCancelled;
(globalThis as any).onEditAccepted = onEditAccepted;

</script>

<template>
  <DataSource :data="data" primaryKey="id">
    <InfiniteTable
      :domProps="height100DomProps"
      :onEditCancelled="onEditCancelled"
      :onEditAccepted="onEditAccepted"
      :columnDefaultEditable="true"
      :columnDefaultWidth="150"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>

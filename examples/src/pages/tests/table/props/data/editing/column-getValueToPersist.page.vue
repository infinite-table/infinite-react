<script setup lang="ts">
import sinon from 'sinon';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import {
  type DeveloperWithSalary,
  dataWithSalary as data,
  height100DomProps,
} from './common';

type Developer = DeveloperWithSalary;

const columns: Record<string, any> = {
  id: {
    field: 'id',
    header: 'ID',
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
  salary: {
    field: 'salary',
    getValueToEdit: ({ value }: { value: string }) => value.substr(1).trim(),
    getValueToPersist: ({
      value,
      initialValue,
    }: {
      value: string;
      initialValue: string;
    }) => {
      return `${initialValue[0]} ${value}`;
    },
  },
};

const onEditCancelled = sinon.spy(() => {});
const onEditRejected = sinon.spy(() => {});
const onEditAccepted = sinon.spy(() => {});

(globalThis as any).onEditCancelled = onEditCancelled;
(globalThis as any).onEditAccepted = onEditAccepted;
(globalThis as any).onEditRejected = onEditRejected;

</script>

<template>
  <DataSource :data="data" primaryKey="id">
    <InfiniteTable
      :domProps="height100DomProps"
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

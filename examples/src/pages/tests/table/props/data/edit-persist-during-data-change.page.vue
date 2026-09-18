<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-vue';

// see edit-persist-during-data-change.page.tsx for the description of this test page

type Developer = {
  id: number;
  firstName: string;
  stack: string;
};

const data: Developer[] = [
  { id: 1, firstName: 'John', stack: 'frontend' },
  { id: 2, firstName: 'Marry', stack: 'frontend' },
  { id: 3, firstName: 'Bill', stack: 'frontend' },
  { id: 4, firstName: 'Mark', stack: 'backend' },
  { id: 5, firstName: 'Dana', stack: 'devops' },
];

type PersistedEdit = {
  id: number;
  firstName: string;
  rowIndex: number;
  value: unknown;
};

(globalThis as any).persistedEdits = [] as PersistedEdit[];

const onEditAccepted = ({ dataSourceApi }: { dataSourceApi: any }) => {
  dataSourceApi.removeDataByPrimaryKey(4);
};

const onEditPersistSuccess = ({
  rowInfo,
  value,
}: {
  rowInfo: any;
  value: unknown;
}) => {
  if (rowInfo.isGroupRow) {
    return;
  }
  (globalThis as any).persistedEdits.push({
    id: rowInfo.data.id,
    firstName: rowInfo.data.firstName,
    rowIndex: rowInfo.indexInAll,
    value,
  } satisfies PersistedEdit);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 80 },
  firstName: { field: 'firstName', defaultEditable: true },
  stack: { field: 'stack' },
};

const groupBy = [{ field: 'stack' as const }];

const domProps = {
  style: { height: '100%' },
};
</script>

<template>
  <DataSource :data="data" primaryKey="id" :groupBy="groupBy">
    <InfiniteTable
      :domProps="domProps"
      :columns="columns"
      :columnDefaultWidth="150"
      :onEditAccepted="onEditAccepted"
      :onEditPersistSuccess="onEditPersistSuccess"
    />
  </DataSource>
</template>

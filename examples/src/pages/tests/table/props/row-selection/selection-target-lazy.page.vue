<script setup lang="ts">
import { ref } from 'vue';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

(globalThis as any).dataParamsCalls = [];

const dataSource = ({
  groupBy,
  groupKeys = [],
  multiRowSelectionTarget,
}: {
  groupBy?: { field: string }[];
  groupKeys?: any[];
  multiRowSelectionTarget?: 'all' | 'visible';
}) => {
  (globalThis as any).dataParamsCalls.push({
    groupKeys,
    multiRowSelectionTarget,
  });
  const args = [
    `groupKeys=${JSON.stringify(groupKeys)}`,
    groupBy
      ? 'groupBy=' + JSON.stringify(groupBy.map((p) => ({ field: p.field })))
      : null,
  ]
    .filter(Boolean)
    .join('&');
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL + `/developers100-sql?` + args,
  ).then((r) => r.json());
};

const columns: Record<string, any> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
};

const groupBy = [{ field: 'stack' }, { field: 'preferredLanguage' }];

const domProps = {
  style: { height: '80vh' },
};

const target = ref<'all' | 'visible'>('visible');

(globalThis as any).setTarget = (value: 'all' | 'visible') => {
  target.value = value;
};
</script>

<template>
  <DataSource
    primaryKey="id"
    :data="dataSource"
    :groupBy="groupBy"
    :lazyLoad="true"
    selectionMode="multi-row"
    :useGroupKeysForMultiRowSelection="true"
    :multiRowSelectionTarget="target"
  >
    <InfiniteTable
      :domProps="domProps"
      :columns="columns"
      groupRenderStrategy="single-column"
      :columnDefaultWidth="200"
    />
  </DataSource>
</template>

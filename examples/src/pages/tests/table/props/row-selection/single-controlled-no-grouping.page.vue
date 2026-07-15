<script setup lang="ts">
import { ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { data, height80vhDomProps } from './common';

const columns: Record<string, any> = {
  id: { field: 'id' },

  firstName: {
    field: 'firstName',
  },

  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
};

const rowSelection = ref<string | number | null>(3);

const onRowSelectionChange = (sel: string | number | null) => {
  rowSelection.value = sel;
};
</script>

<template>
  <div>Selected {{ JSON.stringify(rowSelection) }}</div>
  <DataSource
    primaryKey="id"
    :data="data"
    :rowSelection="rowSelection"
    :onRowSelectionChange="onRowSelectionChange"
  >
    <InfiniteTable :domProps="height80vhDomProps" :columns="columns" />
  </DataSource>
</template>

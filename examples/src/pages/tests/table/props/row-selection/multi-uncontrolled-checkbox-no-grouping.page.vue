<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { data, height80vhDomProps } from './common';

const columns: Record<string, any> = {
  id: { field: 'id', renderSelectionCheckBox: true },

  firstName: {
    field: 'firstName',
  },

  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
};
</script>

<template>
  <DataSource primaryKey="id" :data="data" selectionMode="multi-row">
    <InfiniteTable :domProps="height80vhDomProps" :columns="columns" />
  </DataSource>
</template>

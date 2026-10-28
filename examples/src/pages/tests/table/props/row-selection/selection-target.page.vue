<script setup lang="ts">
import { ref } from 'vue';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { data, height80vhDomProps, type Developer } from './common';

const columns: Record<string, any> = {
  checkbox: { renderSelectionCheckBox: true, defaultWidth: 80 },
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
};

const groupBy = [{ field: 'stack' }];

const filterFunction = ({ data }: { data: Developer }) =>
  data.preferredLanguage !== 'JavaScript';

type Config = {
  target: 'all' | 'visible';
  grouped: boolean;
  useGroupKeys: boolean;
};

const config = ref<Config>({
  target: 'all',
  grouped: false,
  useGroupKeys: false,
});
const filtered = ref(false);

(globalThis as any).setConfig = (value: Config) => {
  config.value = value;
};
(globalThis as any).setFiltered = (value: boolean) => {
  filtered.value = value;
};
</script>

<template>
  <DataSource
    primaryKey="id"
    :data="data"
    selectionMode="multi-row"
    :multiRowSelectionTarget="config.target"
    :useGroupKeysForMultiRowSelection="config.useGroupKeys"
    :groupBy="config.grouped ? groupBy : undefined"
    :filterFunction="filtered ? filterFunction : undefined"
  >
    <InfiniteTable :domProps="height80vhDomProps" :columns="columns" />
  </DataSource>
</template>

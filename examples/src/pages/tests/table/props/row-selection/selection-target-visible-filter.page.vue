<script setup lang="ts">
import { computed, ref } from 'vue';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  preferredLanguage: string;
};

const data: Developer[] = [
  { id: 1, firstName: 'Nya', preferredLanguage: 'Java' },
  { id: 2, firstName: 'Axel', preferredLanguage: 'JavaScript' },
  { id: 3, firstName: 'Gonzalo', preferredLanguage: 'TypeScript' },
  { id: 4, firstName: 'Sherwood', preferredLanguage: 'Java' },
  { id: 5, firstName: 'Mark', preferredLanguage: 'Rust' },
  { id: 6, firstName: 'Alex', preferredLanguage: 'JavaScript' },
];

const columns: Record<string, any> = {
  checkbox: { renderSelectionCheckBox: true, defaultWidth: 80 },
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
};

const domProps = { style: { height: '60vh' } };

const languagePrefix = ref('Java');

(globalThis as any).setLanguagePrefix = (value: string) => {
  languagePrefix.value = value;
};

const filterFunction = computed(() => {
  const prefix = languagePrefix.value;
  return prefix
    ? ({ data }: { data: Developer }) =>
        data.preferredLanguage.startsWith(prefix)
    : undefined;
});
</script>

<template>
  <label style="display: block; padding: 10px; color: tomato">
    Language starts with
    <input data-name="language-prefix" v-model="languagePrefix" />
  </label>
  <DataSource
    primaryKey="id"
    :data="data"
    selectionMode="multi-row"
    multiRowSelectionTarget="visible"
    :filterFunction="filterFunction"
  >
    <InfiniteTable :domProps="domProps" :columns="columns" />
  </DataSource>
</template>

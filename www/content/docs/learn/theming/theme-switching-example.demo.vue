<script setup lang="ts">
import { ref } from 'vue';
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import 'shadcn-ui-css-vars/index.css';
import '@infinite-table/infinite-vue/theme/minimalist.css';
import '@infinite-table/infinite-vue/theme/ocean.css';
import '@infinite-table/infinite-vue/theme/balsam.css';
import '@infinite-table/infinite-vue/theme/shadcn.css';

import { columns } from './columns.vue';
import type { Employee } from './columns.vue';

type ThemeName = 'default' | 'minimalist' | 'ocean' | 'balsam' | 'shadcn';

const currentThemeMode = ref<'light' | 'dark'>('light');
const currentThemeName = ref<ThemeName>('default');

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees100')
    .then((r) => r.json())
    .then((data: Employee[]) => {
      console.log(data);
      return data;
    });
};
</script>

<template>
  <div
    :class="`infinite-theme-mode--${currentThemeMode} infinite-theme-name--${currentThemeName} ${
      currentThemeName === 'shadcn' && currentThemeMode === 'dark' ? 'dark' : ''
    }`"
    :style="{
      display: 'flex',
      flexFlow: 'column',
      flex: 1,
      color: 'var(--infinite-cell-color)',
      background: 'var(--infinite-background)',
    }"
  >
    <DataSource :data="dataSource" primaryKey="id">
      <InfiniteTable debugId="theme-switching-example" :columns="columns" />
    </DataSource>

    <div :style="{ margin: '10px' }">
      Current settings: <b>{{ currentThemeName }}</b> theme,
      <b>{{ currentThemeMode }}</b> mode.
    </div>
    <div
      :style="{
        display: 'flex',
        flexFlow: 'row',
        alignItems: 'center',
        gap: '10px',
        padding: '10px',
      }"
    >
      Select theme
      <select title="Select theme" v-model="currentThemeName">
        <option value="shadcn">Shadcn</option>
        <option value="ocean">Ocean</option>
        <option value="balsam">Balsam</option>
        <option value="minimalist">Minimalist</option>
        <option value="default">Default</option>
      </select>
      <button
        @click="currentThemeMode = currentThemeMode === 'dark' ? 'light' : 'dark'"
      >
        Switch to {{ currentThemeMode === 'dark' ? 'light' : 'dark' }} mode.
      </button>
    </div>
  </div>
</template>

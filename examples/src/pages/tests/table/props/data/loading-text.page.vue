<script setup lang="ts">
import { h } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import {
  type Developer,
  insertData as data,
  insertDataColumns as columns,
  height100DomProps,
} from './common';

const dataSource = () => {
  return new Promise<Developer[]>((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, 500);
  });
};

const loadingText = h(
  'span',
  { title: 'Loading text' },
  'Loading developers ...',
);

</script>

<template>
  <DataSource :data="dataSource" primaryKey="id">
    <InfiniteTable
      :domProps="height100DomProps"
      :loadingText="loadingText"
      :columnDefaultWidth="100"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>

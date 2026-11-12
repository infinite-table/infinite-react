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
    }, 500000);
  });
};

const components = {
  LoadMask: () =>
    h(
      'div',
      {
        title: 'LoadMask',
        style: {
          color: 'magenta',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.4,
          background: 'white',
          width: '100%',
          height: '100%',
          zIndex: 100,
        },
      },
      'xxx',
    ),
};
</script>

<template>
  <DataSource :data="dataSource" primaryKey="id">
    <InfiniteTable
      :domProps="height100DomProps"
      :components="components"
      :columnDefaultWidth="100"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>

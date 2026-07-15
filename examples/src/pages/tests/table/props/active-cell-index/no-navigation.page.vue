<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import {
  columns,
  developers100DataSource,
  height800DomProps,
} from './common';
</script>

<template>
  <DataSource primaryKey="id" :data="developers100DataSource">
    <InfiniteTable
      :columns="columns"
      :keyboardNavigation="false"
      :domProps="height800DomProps"
    />
  </DataSource>
</template>

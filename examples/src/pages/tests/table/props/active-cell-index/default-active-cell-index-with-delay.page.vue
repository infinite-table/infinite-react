<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import {
  columns,
  defaultActiveCellIndex,
  developers100DataSource,
  height800DomProps,
} from './common';
</script>

<template>
  <DataSource primaryKey="id" :data="developers100DataSource">
    <InfiniteTable
      :columns="columns"
      :defaultActiveCellIndex="defaultActiveCellIndex"
      :domProps="height800DomProps"
    />
  </DataSource>
</template>

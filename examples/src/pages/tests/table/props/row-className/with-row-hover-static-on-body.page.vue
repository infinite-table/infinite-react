<script setup lang="ts">
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import { columns, data, minHeight500DomProps } from './common';

const dataSource = () => {
  return Promise.resolve(data.slice(0, data.length - 1));
};

// the React page pushes 'hover-row' into the static
// InfiniteTable.Body.rowHoverClassName array - the Vue build has no Body
// sub-component, so the equivalent top-level prop is used
</script>

<template>
  <DataSource :data="dataSource" primaryKey="id">
    <InfiniteTable
      :columns="columns"
      rowClassName="custom-row"
      rowHoverClassName="hover-row"
      :domProps="minHeight500DomProps"
    />
  </DataSource>
</template>

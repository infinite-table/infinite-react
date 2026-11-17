<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-vue';

type Person = {
  id: number;
  firstName: string;
  age: number;
};

const data: Person[] = Array.from({ length: 20 }, (_, index) => ({
  id: index,
  firstName: `Person ${index}`,
  age: 20 + index,
}));

const columns: InfiniteTablePropColumns<Person> = {
  id: { field: 'id', type: 'number' },
  firstName: { field: 'firstName' },
  age: { field: 'age', type: 'number' },
};

const domProps = {
  style: { height: '80vh' },
};
</script>

<template>
  <DataSource :data="data" primaryKey="id">
    <InfiniteTable
      :columns="columns"
      :columnDefaultWidth="150"
      :domProps="domProps"
    />
  </DataSource>
</template>

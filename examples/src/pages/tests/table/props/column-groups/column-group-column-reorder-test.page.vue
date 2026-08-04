<script setup lang="ts">
import { ref } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

type TestCols = {
  id: string;
  a1: string;
  b1: string;
  c1: string;
  d1: string;
  a2: string;
  b2: string;
  c2: string;
  d2: string;
  a3: string;
  b3: string;
  c3: string;
  d3: string;
};

const columns: Record<string, any> = {
  a1: {
    field: 'a1',
    columnGroup: '1',
  },
  b1: {
    field: 'b1',
    columnGroup: '1',
  },
  c1: {
    field: 'c1',
    columnGroup: '1',
  },
  d1: {
    field: 'd1',
    columnGroup: '1',
  },
  a2: {
    field: 'a2',
    columnGroup: '2',
  },
  b2: {
    field: 'b2',
    columnGroup: '2',
  },
  c2: {
    field: 'c2',
    columnGroup: '2',
  },
  d2: {
    field: 'd2',
    columnGroup: '2',
  },
  a3: {
    field: 'a3',
    columnGroup: '3',
  },
  b3: {
    field: 'b3',
    columnGroup: '3',
  },
  c3: {
    field: 'c3',
    columnGroup: '3',
  },
  d3: {
    field: 'd3',
    columnGroup: '3',
  },
};

const columnGroups: Record<string, any> = {
  1: {
    header: 'One',
  },
  2: {
    header: 'Two',
  },
  3: {
    header: 'Three',
  },
};

const data: TestCols[] = [];

const columnGroupVisibility = ref<Record<string, boolean>>({
  1: true,
  2: true,
  3: true,
});

const toggleGroup = (groupId: string) => {
  columnGroupVisibility.value = {
    ...columnGroupVisibility.value,
    [groupId]: !columnGroupVisibility.value[groupId],
  };
};

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    width: '80vw',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};
</script>

<template>
  <button @click="toggleGroup('1')">toggle group 1</button>
  <button @click="toggleGroup('2')">toggle group 2</button>
  <button @click="toggleGroup('3')">toggle group 3</button>
  <DataSource primaryKey="id" :data="data">
    <InfiniteTable
      :domProps="domProps"
      :columnGroupVisibility="columnGroupVisibility"
      draggableColumnsRestrictTo="group"
      :columnGroups="columnGroups"
      :columns="columns"
      :columnDefaultWidth="90"
    />
  </DataSource>
</template>

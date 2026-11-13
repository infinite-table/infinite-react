<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  country: string;
  age: number;
};

const data: Developer[] = [
  { id: 1, firstName: 'Ana', country: 'Italy', age: 30 },
  { id: 2, firstName: 'Bob', country: 'Italy', age: 40 },
  { id: 3, firstName: 'Cid', country: 'France', age: 35 },
];

const columns: Record<string, any> = {
  id: { field: 'id', type: 'number', defaultWidth: 80 },
  firstName: { field: 'firstName' },
  country: { field: 'country' },
  age: { field: 'age', type: 'number' },
};

const columnPinning = { id: 'start' };
const defaultFilterValue: any[] = [];
const defaultActiveCellIndex = [1, 1];

const domProps = {
  style: {
    height: '100%',
  },
};

// Every grid has its mode set with a className (on a parent of the element
// that has the theme className), so the color scheme of the OS should not
// matter for any of them.
const sections = ['ocean', 'balsam', 'minimalist'].flatMap((theme) =>
  ['light', 'dark'].map((mode) => ({ theme, mode })),
);
</script>

<template>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px">
    <div
      v-for="section in sections"
      :key="`${section.theme}-${section.mode}`"
      :class="`infinite-theme-mode--${section.mode}`"
    >
      <div
        :data-name="`${section.theme}-${section.mode}`"
        :class="`infinite-theme-name--${section.theme}`"
        style="height: 220px"
      >
        <DataSource
          primaryKey="id"
          :data="data"
          :defaultFilterValue="defaultFilterValue"
        >
          <InfiniteTable
            :domProps="domProps"
            :columns="columns"
            :columnDefaultWidth="120"
            :defaultColumnPinning="columnPinning"
            :defaultActiveCellIndex="defaultActiveCellIndex"
          />
        </DataSource>
      </div>
    </div>
  </div>
</template>

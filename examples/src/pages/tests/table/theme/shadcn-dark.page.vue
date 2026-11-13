<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { shadcnVarsCSS } from './shadcnVars';

type Developer = {
  id: number;
  firstName: string;
  country: string;
  stack: string;
  age: number;
};

const data: Developer[] = [
  { id: 1, firstName: 'Ana', country: 'Italy', stack: 'frontend', age: 30 },
  { id: 2, firstName: 'Bob', country: 'Italy', stack: 'backend', age: 40 },
  { id: 3, firstName: 'Cid', country: 'France', stack: 'frontend', age: 35 },
  { id: 4, firstName: 'Dan', country: 'France', stack: 'backend', age: 50 },
  { id: 5, firstName: 'Eve', country: 'Spain', stack: 'fullstack', age: 28 },
  { id: 6, firstName: 'Fay', country: 'Spain', stack: 'backend', age: 45 },
];

const columns: Record<string, any> = {
  id: { field: 'id', type: 'number', defaultWidth: 80 },
  firstName: { field: 'firstName' },
  country: { field: 'country' },
  stack: { field: 'stack' },
  age: { field: 'age', type: 'number' },
};

const columnPinning = { id: 'start' };

const rowDisabledState = {
  enabledRows: true,
  disabledRows: [2, 3],
};

const defaultFilterValue: any[] = [];

const domProps = {
  style: {
    height: '100%',
  },
};

const sectionStyle = {
  flex: 1,
  padding: '10px',
  background: 'var(--background)',
  color: 'var(--foreground)',
};

// The shadcn theme takes its colors from the shadcn/ui CSS variables of the
// page, which are in dark mode under the `dark` className.
//
// No `infinite-theme-mode--*` className is used here.
const sections = [
  { name: 'light', className: 'infinite-theme-name--shadcn' },
  { name: 'dark', className: 'dark infinite-theme-name--shadcn' },
];
</script>

<template>
  <div style="display: flex; height: 80vh">
    <component :is="'style'">{{ shadcnVarsCSS }}</component>
    <div
      v-for="section in sections"
      :key="section.name"
      :data-name="section.name"
      :style="sectionStyle"
      :class="section.className"
    >
      <DataSource
        primaryKey="id"
        :data="data"
        :defaultFilterValue="defaultFilterValue"
        :defaultRowDisabledState="rowDisabledState"
      >
        <InfiniteTable
          :domProps="domProps"
          :columns="columns"
          :columnDefaultWidth="140"
          :defaultColumnPinning="columnPinning"
          :defaultActiveRowIndex="0"
          keyboardNavigation="row"
        />
      </DataSource>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { employees } from '../props/group-by/employees10';

const columns: Record<string, any> = {
  firstName: { field: 'firstName', header: 'First Name' },
  country: { field: 'country', header: 'Country' },
  department: { field: 'department', header: 'Department' },
  age: { field: 'age', type: 'number', header: 'Age' },
};

type Density = '' | 'compact' | 'comfortable' | 'spacious';

const densityCls = (density: Density) =>
  density ? `infinite-density--${density}` : '';

(globalThis as any).rowHeightChanges = [];
const onRowHeightChange = (rowHeight: number) => {
  (globalThis as any).rowHeightChanges.push(rowHeight);
};

const wrapperDensity = ref<Density>('');
const gridDensity = ref<Density>('');

const defaultGridDomProps = computed(() => ({
  className: densityCls(gridDensity.value),
  style: { height: '400px' },
}));
const explicitGridDomProps = { style: { height: '300px' } };

const reset = () => {
  wrapperDensity.value = '';
  gridDensity.value = '';
};
</script>
<template>
  <div>
    <div>
      <button data-name="wrapper-compact" @click="wrapperDensity = 'compact'">
        wrapper: compact
      </button>
      <button data-name="wrapper-spacious" @click="wrapperDensity = 'spacious'">
        wrapper: spacious
      </button>
      <button data-name="grid-spacious" @click="gridDensity = 'spacious'">
        grid: spacious
      </button>
      <button data-name="grid-comfortable" @click="gridDensity = 'comfortable'">
        grid: comfortable
      </button>
      <button data-name="reset" @click="reset">reset</button>
    </div>
    <div id="wrapper" :class="densityCls(wrapperDensity)">
      <div id="default-grid">
        <DataSource :data="employees" primaryKey="id">
          <InfiniteTable
            :domProps="defaultGridDomProps"
            :onRowHeightChange="onRowHeightChange"
            :columns="columns"
          />
        </DataSource>
      </div>
      <div id="explicit-grid">
        <DataSource :data="employees" primaryKey="id">
          <InfiniteTable
            :domProps="explicitGridDomProps"
            :rowHeight="30"
            :columnHeaderHeight="50"
            :columns="columns"
          />
        </DataSource>
      </div>
    </div>
  </div>
</template>

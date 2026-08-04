<script setup lang="ts">
import { computed, ref } from 'vue';

import {
  DataSource,
  InfiniteTable,
  GroupRowsState,
} from '@infinite-table/infinite-vue';

import { employees } from './employees10';

const dataSource = () => {
  return Promise.resolve(employees);
};

const columns: Record<string, any> = {
  firstName: {
    field: 'firstName',
    header: 'First Name',
  },
  country: {
    field: 'country',
    header: 'Country',
  },
  department: {
    field: 'department',
    header: 'Department',
  },
};

const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

const domProps = {
  style: {
    margin: '5px',
    height: '900px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

const groupColumnFn = (options: any) => {
  const { groupByForColumn } = options;

  return {
    id: 'g-for-' + groupByForColumn?.field,
    header: `G for ${groupByForColumn?.field}`,
  };
};

const customGroupColumnId = ref(false);

const groupBy = computed<any[]>(() => [
  {
    field: 'department',
  },
  {
    field: 'country',
    column: customGroupColumnId.value
      ? { id: 'custom-country', header: 'custom-country' }
      : undefined,
  },
]);

const hideEmptyGroupColumns = ref(true);

const toggleCustomGroupColumnId = () => {
  customGroupColumnId.value = !customGroupColumnId.value;
};

const toggleHideEmptyGroupColumns = () => {
  hideEmptyGroupColumns.value = !hideEmptyGroupColumns.value;
};
</script>

<template>
  <button @click="toggleCustomGroupColumnId">
    use custom group column id
  </button>
  <label @change="toggleHideEmptyGroupColumns">
    Hide empty group columns
    <input type="checkbox" :checked="hideEmptyGroupColumns" />
  </label>
  <DataSource
    :data="dataSource"
    primaryKey="id"
    :groupBy="groupBy"
    :defaultGroupRowsState="groupRowsState"
  >
    <InfiniteTable
      :domProps="domProps"
      :groupColumn="groupColumnFn"
      :hideEmptyGroupColumns="hideEmptyGroupColumns"
      :columnDefaultWidth="200"
      :columns="columns"
    />
  </DataSource>
</template>

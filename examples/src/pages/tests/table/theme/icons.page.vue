<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { employees } from '../props/group-by/employees10';

const columns: Record<string, any> = {
  firstName: { field: 'firstName', header: 'First Name' },
  department: { field: 'department', header: 'Department' },
  age: { field: 'age', type: 'number', header: 'Age' },
  salary: { field: 'salary', type: 'number', header: 'Salary' },
};

const groupBy = [{ field: 'country' }];

const defaultSortInfo = [
  { field: 'firstName', dir: 1 },
  { field: 'age', dir: -1 },
];

const defaultFilterValue = [
  {
    field: 'department',
    filter: { type: 'string', operator: 'includes', value: 'e' },
  },
];

const domProps = {
  style: { height: '600px', margin: '10px' },
};
</script>
<template>
  <DataSource
    :data="employees"
    primaryKey="id"
    :groupBy="groupBy"
    :defaultSortInfo="defaultSortInfo"
    :defaultFilterValue="defaultFilterValue"
  >
    <InfiniteTable
      :domProps="domProps"
      :columns="columns"
      :columnDefaultWidth="220"
    />
  </DataSource>
</template>

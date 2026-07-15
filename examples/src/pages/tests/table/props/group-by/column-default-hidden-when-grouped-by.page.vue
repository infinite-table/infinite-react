<script setup lang="ts">
import { ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { employees } from './employees10';

const dataSource = () => {
  return Promise.resolve(employees);
};

const columns: Record<string, any> = {
  firstNameID: {
    field: 'firstName',
    header: 'First Name',
  },

  countryID: {
    field: 'country',
  },

  cityID: {
    field: 'city',
  },

  streetNameID: {
    field: 'streetName',
  },
  streetNoID: {
    field: 'streetNo',
  },
  ageID: {
    field: 'age',
    type: 'number',
  },
  departmentID: {
    field: 'department',
    defaultHiddenWhenGroupedBy: 'department',
  },
  salaryID: {
    field: 'salary',
    type: 'number',
    defaultHiddenWhenGroupedBy: { salary: true, team: true },
  },
  teamID: {
    field: 'team',
    defaultHiddenWhenGroupedBy: '*',
  },

  companyID: { field: 'companyName' },
  companySizeID: { field: 'companySize' },
};

const groupBy = ref<any[]>([
  {
    field: 'country',
  },
  { field: 'city' },
  { field: 'department' },
  { field: 'team' },
  { field: 'companySize' },
]);

(globalThis as any).setGroupBy = (newGroupBy: any[]) => {
  groupBy.value = newGroupBy;
};

const domProps = {
  style: {
    margin: '5px',
    height: '900px',
    minWidth: '10000px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

const groupColumn = ({ groupByForColumn }: { groupByForColumn?: any }) => {
  return {
    defaultWidth: 200,
    header: `Group by ${groupByForColumn?.field}`,
  };
};
</script>

<template>
  <DataSource :data="dataSource" primaryKey="id" :groupBy="groupBy">
    <InfiniteTable
      :domProps="domProps"
      :groupColumn="groupColumn"
      :columnDefaultWidth="100"
      :columns="columns"
    />
  </DataSource>
</template>

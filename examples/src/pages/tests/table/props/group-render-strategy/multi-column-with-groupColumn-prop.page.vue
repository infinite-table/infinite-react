<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { data } from './pivotData';
import type { Person } from './pivotData';

const domProps = {
  style: {
    height: '60vh',
    border: '1px solid gray',
    width: 'calc(100% - 20px)',
    marginLeft: '10px',
  },
};

const groupBy = [
  {
    field: 'department' as const,
    column: {
      id: 'dep-group',
      header: 'Department grouping',
    },
  },
  {
    field: 'team' as const,
    column: {
      id: 'my-custom-team-group',
      style: {
        color: 'rgb(255, 0, 0)',
      },
      headerStyle: {
        color: 'red',
      },
    },
  },
  {
    field: 'country' as const,
  },
];

const columns: Record<string, any> = {
  department: {
    field: 'department' as keyof Person,
  },
  team: {
    field: 'team' as keyof Person,
  },
  id: { field: 'id' as keyof Person },
  name: { field: 'name' as keyof Person },
};

const groupColumn = ({ groupByForColumn }: { groupByForColumn?: any }) => {
  const col: Record<string, any> = {
    style: {
      color: 'rgb(0, 100, 0)',
    },
  };
  if (groupByForColumn?.field === 'department') {
    col.id = 'xx-dep-xx';
  }

  return col;
};
</script>

<template>
  <DataSource primaryKey="id" :data="data" :groupBy="groupBy">
    <InfiniteTable
      :domProps="domProps"
      :columns="columns"
      :groupColumn="groupColumn"
      :columnDefaultWidth="140"
      groupRenderStrategy="multi-column"
    />
  </DataSource>
</template>

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
      style: {
        color: 'blue',
      },
    },
  },
  {
    field: 'team' as const,
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
  country: { field: 'country' as keyof Person },

  salary: {
    field: 'salary' as keyof Person,
  },
};

const groupColumn = () => {
  return {
    header: 'The Group Column',
    id: 'the-group',
    style: ({ rowInfo }: { rowInfo: any }) => {
      if (rowInfo.isGroupRow && rowInfo.groupNesting === 2) {
        return {
          color: 'rgb(0, 255, 0)',
        };
      }

      return {
        color: 'red',
      };
    },
  };
};
</script>

<template>
  <DataSource primaryKey="id" :data="data" :groupBy="groupBy">
    <InfiniteTable
      :domProps="domProps"
      :groupColumn="groupColumn"
      :columns="columns"
      :columnDefaultWidth="140"
      groupRenderStrategy="single-column"
    />
  </DataSource>
</template>

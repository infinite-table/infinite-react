<script setup lang="ts">
import { ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

type Developer = {
  id: number;

  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => {
      return data;
    });
};

const columns: Record<string, any> = {
  id: { field: 'id' },

  firstName: {
    field: 'firstName',
  },

  preferredLanguage: {
    field: 'preferredLanguage',
  },
  stack: {
    field: 'stack',
    defaultHiddenWhenGroupedBy: true,
  },
};

const domProps = {
  style: {
    height: '80vh',
  },
};

const groupBy = [
  { field: 'stack' },
  {
    field: 'preferredLanguage',
  },
];

const groupColumn = {
  field: 'firstName' as const,
};

const currentGroupBy = ref<any[]>(groupBy);

const ungroup = () => {
  currentGroupBy.value = [];
};

const groupAgain = () => {
  currentGroupBy.value = groupBy;
};
</script>

<template>
  <button @click="ungroup">ungroup</button>
  <button @click="groupAgain">group by stack and preferred language</button>
  <DataSource
    primaryKey="id"
    :data="dataSource"
    :groupBy="currentGroupBy"
    selectionMode="multi-row"
  >
    <InfiniteTable
      :domProps="domProps"
      :columns="columns"
      keyboardNavigation="row"
      groupRenderStrategy="single-column"
      :hideColumnWhenGrouped="true"
      :groupColumn="groupColumn"
      :columnDefaultWidth="200"
    />
  </DataSource>
</template>

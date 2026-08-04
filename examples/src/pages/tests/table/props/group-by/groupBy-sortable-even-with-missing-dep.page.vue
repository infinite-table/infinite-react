<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

type Person = {
  id: number;
  country: string;
  name: string;
  age: number;
  salary: number;
  team: string;
  department: string;
};

const data: Person[] = [
  {
    id: 1,
    name: 'john',
    country: 'UK',
    department: 'it',
    age: 8,
    salary: 50000,
    team: 'backend',
  },
  {
    id: 2,
    name: 'bill',
    country: 'UK',
    department: 'it',
    age: 20,
    salary: 55000,
    team: 'frontend',
  },
  {
    id: 3,
    name: 'bob',
    country: 'UK',
    department: 'it',
    age: 102,
    salary: 45000,
    team: 'frontend',
  },
  {
    id: 4,
    name: 'marrie',
    country: 'France',
    department: 'it',
    age: 102,
    salary: 60000,
    team: 'backend',
  },
  {
    id: 5,
    name: 'espania',
    country: 'Italy',
    department: 'devops',
    age: 102,
    salary: 70000,
    team: 'backend',
  },
  {
    id: 6,
    name: 'roberta',
    country: 'Spain',
    department: 'it',
    age: 20,
    salary: 30000,
    team: 'backend',
  },
  {
    id: 7,
    name: 'marrio',
    country: 'Italy',
    department: 'devops',
    age: 15,
    salary: 40000,
    team: 'frontend',
  },
];

const columns: Record<string, any> = {
  department: {
    field: 'department',
    style: {
      color: 'red',
    },
  },
};

const groupBy = [
  { field: 'team' as const },
  {
    field: 'age' as const,
  },
];

const slicedData = data.slice(0, 7);

const groupColumn = {
  id: 'group-test',
  field: 'name' as const,
  header: 'People',
  sortType: ['string', 'number'],
};

const domProps = {
  style: {
    margin: '5px',
    height: '1000px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};
</script>

<template>
  <DataSource :data="slicedData" primaryKey="id" :groupBy="groupBy">
    <InfiniteTable
      :groupColumn="groupColumn"
      :domProps="domProps"
      groupRenderStrategy="single-column"
      :columnDefaultWidth="250"
      :columns="columns"
    />
  </DataSource>
</template>

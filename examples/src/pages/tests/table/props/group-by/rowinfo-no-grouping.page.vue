<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

type Person = {
  id: number;
  country: string;
  city: string;
  firstName: string;
};

const dataSource = () => {
  return Promise.resolve([
    {
      id: 1,
      country: 'Italy',
      city: 'Rome',
      firstName: 'Giuseppe',
    },
    {
      id: 2,
      country: 'Italy',
      city: 'Rome',
      firstName: 'Marco',
    },
    {
      id: 3,
      country: 'Italy',
      city: 'Napoli',
      firstName: 'Luca',
    },
    {
      id: 4,
      country: 'USA',
      city: 'LA',
      firstName: 'Bob',
    },
  ] as Person[]);
};

const columns: Record<string, any> = {
  firstName: {
    field: 'firstName',
    header: 'First Name',
  },
};

const domProps = {
  style: {
    margin: '5px',
    height: '900px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

const setDataArray = (dataArray: any) => {
  (globalThis as any).dataArray = dataArray;
  return '';
};
</script>

<template>
  <DataSource :data="dataSource" primaryKey="id">
    <template v-slot="{ dataArray }">
      {{ setDataArray(dataArray) }}
      <InfiniteTable
        :domProps="domProps"
        :columnDefaultWidth="300"
        :columns="columns"
      />
    </template>
  </DataSource>
</template>

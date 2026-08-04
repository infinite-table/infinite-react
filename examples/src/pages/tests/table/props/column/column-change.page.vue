<script setup lang="ts">
import { computed, ref } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type {
  InfiniteTablePropColumns,
  DataSourceData,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;

  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource: DataSourceData<Developer> = ({}) => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers10k-sql`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const useCustomNameRender = ref(false);

const columns = computed<InfiniteTablePropColumns<Developer>>(() => {
  return {
    firstName: {
      field: useCustomNameRender.value ? 'lastName' : 'firstName',
      defaultWidth: useCustomNameRender.value ? 500 : 200,
      render: useCustomNameRender.value
        ? ({ value }: { value: any }) => {
            return value + '!!!';
          }
        : undefined,
    },
    salary: {
      field: 'salary',
      type: 'number',
    },

    stack: { field: 'stack' },
  };
});

const toggle = () => {
  useCustomNameRender.value = !useCustomNameRender.value;
};

const domProps = {
  style: {
    margin: '5px',
    height: '500px',
    width: '1000px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};
</script>

<template>
  <button @click="toggle">toggle firstName with custom render</button>
  <DataSource :data="dataSource" primaryKey="id">
    <InfiniteTable
      :domProps="domProps"
      :columnDefaultWidth="100"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>

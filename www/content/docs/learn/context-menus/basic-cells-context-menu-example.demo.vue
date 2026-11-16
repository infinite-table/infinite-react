<script setup lang="ts">
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import type {
  InfiniteTablePropColumns,
  InfiniteTablePropGetCellContextMenuItems,
} from '@infinite-table/infinite-vue';

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
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  stack: {
    field: 'stack',

    header: 'Stack',
  },
  firstName: {
    field: 'firstName',
    header: 'Name',
  },
  age: {
    field: 'age',
    header: 'Age',
  },
  hobby: {
    field: 'hobby',
    header: 'Hobby',
  },
  preferredLanguage: {
    header: 'Language',
    field: 'preferredLanguage',
  },
};

const getCellContextMenuItems: InfiniteTablePropGetCellContextMenuItems<
  Developer
> = ({ data, column }) => {
  return [
    {
      key: 'hello',
      label: `Hello, ${data?.lastName} ${data?.firstName}`,
      onClick: () => {
        alert(`Hello, ${data?.lastName} ${data?.firstName}`);
      },
    },
    {
      key: 'col',
      label: `Current clicked column: ${column.header}`,
    },
    {
      key: 'learn',
      label: `Learn`,
      menu: {
        items: [
          {
            key: 'backend',
            label: 'Backend',
            onClick: () => {
              alert(`Learn Backend, ${data?.lastName} ${data?.firstName}`);
            },
          },
          {
            key: 'frontend',
            label: 'Frontend',
            onClick: () => {
              alert(`Learn Frontend, ${data?.lastName} ${data?.firstName}`);
            },
          },
        ],
      },
    },
  ];
};
</script>

<template>
  <DataSource primaryKey="id" :data="dataSource">
    <InfiniteTable
      debugId="basic-cells-context-menu-example"
      :columns="columns"
      :getCellContextMenuItems="getCellContextMenuItems"
    />
  </DataSource>
</template>

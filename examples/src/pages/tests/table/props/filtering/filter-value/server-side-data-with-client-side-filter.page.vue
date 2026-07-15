<script setup lang="ts">
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

(globalThis as any).dataCalls = 0;

const dataSource = ({ filterValue, sortInfo }: any) => {
  if (sortInfo && !Array.isArray(sortInfo)) {
    sortInfo = [sortInfo];
  }

  (globalThis as any).dataCalls++;

  const args = [
    filterValue
      ? 'filterBy=' +
        JSON.stringify(
          filterValue.map(({ field, filter }: any) => {
            return {
              field: field,
              value: filter.value,
              operator: filter.operator,
            };
          }),
        )
      : null,
    sortInfo
      ? 'sortInfo=' +
        JSON.stringify(
          sortInfo.map((s: any) => ({
            field: s.field,
            dir: s.dir,
          })),
        )
      : null,
  ]
    .filter(Boolean)
    .join('&');

  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers100-sql?` + args)
    .then((r) => r.json())
    .then((data) => {
      return new Promise((resolve) => {
        data.totalCountUnfiltered = 100;
        resolve(data);
      });
    });
};

const columns: Record<string, any> = {
  identifier: {
    field: 'id',
  },
  name: {
    field: 'firstName',
    name: 'First Name',
  },
  city: { field: 'city' },
  stack: { field: 'stack' },

  fullName: {
    name: 'Full name',
    render: ({ data }: { data: Developer | null }) => {
      return `${data?.firstName} - ${data?.lastName}`;
    },
  },
  age: {
    field: 'age',
    type: 'number',
  },
  salary: {
    field: 'salary',
    type: 'number',
  },
  country: {
    field: 'country',
  },
};

const domProps = {
  style: {
    margin: '5px',
    height: '500px',
    flex: 'none',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

const shouldReloadData = {
  filterValue: false,
  sortInfo: true,
};

const defaultFilterValue: any[] = [];
</script>

<template>
  <DataSource
    :data="dataSource"
    primaryKey="id"
    :filterDelay="0"
    :shouldReloadData="shouldReloadData"
    :defaultFilterValue="defaultFilterValue"
  >
    <InfiniteTable
      :showColumnFilters="true"
      :domProps="domProps"
      :columnDefaultWidth="150"
      :columns="columns"
    />
  </DataSource>
</template>

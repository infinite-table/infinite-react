<script setup lang="ts">
import { h } from 'vue';

import {
  DataSource,
  InfiniteTable,
  GroupRowsState,
} from '@infinite-table/infinite-vue';

import { employees } from './employees10';

type Employee = {
  id: number;
  companyName: string;
  companySize: string;
  firstName: string;
  lastName: string;
  country: string;
  countryCode: string;
  city: string;
  streetName: string;
  streetNo: number;
  department: string;
  team: string;
  salary: number;
  age: number;
  email: string;
};

const dataSource = () => {
  return Promise.resolve(employees as Employee[]);
};

const columns: Record<string, any> = {
  firstName: {
    field: 'firstName',
    header: 'First Name',
  },
  country: {
    field: 'country',
    header: 'Country',

    columnGroup: 'location',
    render: ({ value, rowInfo }: { value: any; rowInfo: any }) => {
      if (!rowInfo.isGroupRow) {
        return value;
      }
      const { isGroupRow, groupKeys } = rowInfo;
      if (isGroupRow) {
        return `Group for ${groupKeys?.join(',')}`;
      }
      return h('b', `${value}x`);
    },
  },
  city: {
    field: 'city',
    header: 'City',
    columnGroup: 'address',
  },
  streetName: {
    field: 'streetName',
    header: 'Street Name',
    columnGroup: 'street',
  },
  streetNo: {
    columnGroup: 'street',
    field: 'streetNo',
    header: 'Street Number',
  },
  age: {
    field: 'age',
    type: 'number',
    header: 'Age',
  },
  department: {
    field: 'department',
    header: 'Department',
  },
  salary: {
    field: 'salary',
    type: 'number',
    header: 'Salary',

    render: ({ value, rowInfo }: { value: any; rowInfo: any }) => {
      if (rowInfo.isGroupRow) {
        return h('span', [
          'Avg salary ',
          h('b', `${rowInfo.groupKeys?.join(', ')}`),
          ': ',
          h('b', `${rowInfo.reducerResults?.salary}`),
        ]);
      }
      return `${value}`;
    },
  },
  team: {
    field: 'team',
    header: 'Team',
  },
  company: { field: 'companyName', header: 'Company' },
  companySize: { field: 'companySize', header: 'Company Size' },
};

const columnGroups = {
  address: { columnGroup: 'location', header: 'Address' },
  street: { columnGroup: 'address', header: 'Street' },
  location: { header: 'Location' },
};

const reducers = {
  salary: {
    initialValue: 0,
    field: 'salary' as const,

    reducer: (acc: number, sum: number) => acc + sum,
    done: (sum: number, arr: any[]) =>
      Math.floor(arr.length ? sum / arr.length : 0),
  },
};

const groupRowsState = new GroupRowsState({
  expandedRows: [['Cuba', 'Havana'], ['Cuba']],
  collapsedRows: true,
});

const groupBy = [
  {
    field: 'country' as const,
  },
  { field: 'city' as const, column: { header: 'hey' } },
];

const onGroupRowsStateChange = (state: any) => {
  console.log(state);
};

const groupColumn = ({ groupByForColumn }: { groupByForColumn?: any }) => {
  return {
    header: `Group ${groupByForColumn?.field}`,
  };
};

const domProps = {
  style: {
    margin: '5px',
    height: '900px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};
</script>

<template>
  <DataSource
    :data="dataSource"
    primaryKey="id"
    :groupBy="groupBy"
    :aggregationReducers="reducers"
    :defaultGroupRowsState="groupRowsState"
    :onGroupRowsStateChange="onGroupRowsStateChange"
  >
    <InfiniteTable
      :domProps="domProps"
      :groupColumn="groupColumn"
      :columnDefaultWidth="100"
      :columns="columns"
      :columnGroups="columnGroups"
    />
  </DataSource>
</template>

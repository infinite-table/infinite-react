<script setup lang="ts">
import { ref } from 'vue';
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-vue';

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
  streetNo: string;
  department: string;
  team: string;
  salary: number;
  age: number;
  email: string;
};

const columns: InfiniteTablePropColumns<Employee> = {
  firstName: {
    field: 'firstName',
    header: 'First Name',
  },
  country: {
    field: 'country',
    header: 'Country',
    columnGroup: 'location',
  },

  city: {
    field: 'city',
    header: 'City',
    columnGroup: 'address',
  },
  salary: {
    field: 'salary',
    type: 'number',
    header: 'Salary',
  },
  department: {
    field: 'department',
    header: 'Department',
  },
  team: {
    field: 'team',
    header: 'Team',
  },
  company: { field: 'companyName', header: 'Company' },

  companySize: {
    field: 'companySize',
    header: 'Company Size',
  },
};

const columnOrder = ref<string[] | true>([
  'firstName',
  'country',
  'team',
  'company',
  'firstName',
  'not existing column',
  'companySize',
]);

const setColumnOrder = (value: string[] | true) => {
  columnOrder.value = value;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees100')
    .then((r) => r.json())
    .then((data: Employee[]) => data);
};
</script>

<template>
  <div :style="{ color: 'var(--infinite-cell-color)' }">
    <p>
      Current column order:
      <code>
        <pre>{{ JSON.stringify(columnOrder) }}.</pre>
      </code>
    </p>
    <p>
      Note: if the column order contains columns that don't exist in the
      `columns` definition, they will be skipped.
    </p>

    <button
      :style="{
        border: '2px solid currentColor',
        padding: '5px',
      }"
      @click="setColumnOrder(['firstName', 'country'])"
    >
      Click to only show "firstName" and "country".
    </button>

    <button
      :style="{
        border: '2px solid currentColor',
        padding: '5px',
        marginLeft: '5px',
      }"
      @click="setColumnOrder(true)"
    >
      Click to reset column order.
    </button>
  </div>

  <DataSource :data="dataSource" primaryKey="id">
    <InfiniteTable
      debugId="columnOrder-advanced-example"
      :columns="columns"
      :columnOrder="columnOrder"
      :onColumnOrderChange="setColumnOrder"
      :columnDefaultWidth="200"
    />
  </DataSource>
</template>

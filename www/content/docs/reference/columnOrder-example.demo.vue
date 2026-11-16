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

const columnOrder = ref<string[]>([
  'firstName',
  'country',
  'team',
  'company',
  'department',
  'companySize',
]);

const setColumnOrder = (newColumnOrder: string[]) => {
  columnOrder.value = newColumnOrder;
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
        <pre>{{ columnOrder.join(', ') }}.</pre>
      </code>
    </p>
    <p>Drag column headers to reorder.</p>
  </div>

  <DataSource :data="dataSource" primaryKey="id">
    <InfiniteTable
      debugId="columnOrder-example"
      :columns="columns"
      :columnOrder="columnOrder"
      :onColumnOrderChange="setColumnOrder"
      :columnDefaultWidth="200"
    />
  </DataSource>
</template>

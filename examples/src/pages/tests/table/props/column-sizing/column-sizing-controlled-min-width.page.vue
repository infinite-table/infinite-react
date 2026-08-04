<script setup lang="ts">
import { ref } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type {
  InfiniteTableColumn,
  InfiniteTablePropColumnSizing,
} from '@infinite-table/infinite-vue';

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

const columns: Record<string, InfiniteTableColumn<Employee>> = {
  firstName: {
    field: 'firstName',
    header: 'First Name',
  },
  country: {
    field: 'country',
    header: 'Country',
  },

  city: {
    field: 'city',
    header: 'City',
  },

  salary: {
    field: 'salary',
    type: 'number',
    header: 'Salary',
  },
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees100')
    .then((r) => r.json())
    .then((data: Employee[]) => data);
};

const columnSizing = ref<InfiniteTablePropColumnSizing>({
  country: { width: 100 },
  city: { flex: 1, minWidth: 300 },
  salary: { flex: 2 },
});

const onColumnSizingChange = (sizing: InfiniteTablePropColumnSizing) => {
  columnSizing.value = sizing;
};

const domProps = {
  style: {
    height: '600px',
  },
};
</script>

<template>
  <div>
    Current column sizing:
    <code style="color: tomato">
      <pre>{{ JSON.stringify(columnSizing, null, 2) }}</pre>
    </code>
  </div>
  <DataSource :data="dataSource" primaryKey="id">
    <InfiniteTable
      :domProps="domProps"
      :columns="columns"
      :columnDefaultWidth="50"
      :columnSizing="columnSizing"
      :onColumnSizingChange="onColumnSizingChange"
    />
  </DataSource>
</template>

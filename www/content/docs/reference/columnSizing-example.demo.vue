<script setup lang="ts">
import { ref } from 'vue';
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import type {
  InfiniteTablePropColumnSizing,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-vue';

const columns: InfiniteTablePropColumns<Employee> = {
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

const columnSizing = ref<InfiniteTablePropColumnSizing>({
  country: { width: 100 },
  city: { flex: 1, minWidth: 100 },
  salary: { flex: 2, maxWidth: 500 },
});

const setColumnSizing = (value: InfiniteTablePropColumnSizing) => {
  columnSizing.value = value;
};

const viewportReservedWidth = ref(0);

const setViewportReservedWidth = (value: number) => {
  viewportReservedWidth.value = value;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees100')
    .then((r) => r.json())
    .then((data: Employee[]) => data);
};

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
</script>

<template>
  <p :style="{ color: 'var(--infinite-cell-color)' }">
    Current column sizing:
    <code>
      <pre>{{ JSON.stringify(columnSizing, null, 2) }}</pre>
    </code>
    Viewport reserved width: {{ viewportReservedWidth }} -
    <button @click="setViewportReservedWidth(0)">click to reset to 0</button>
  </p>
  <DataSource :data="dataSource" primaryKey="id">
    <InfiniteTable
      debugId="columnSizing-example"
      :columns="columns"
      :columnDefaultWidth="50"
      :columnSizing="columnSizing"
      :onColumnSizingChange="setColumnSizing"
      :viewportReservedWidth="viewportReservedWidth"
      :onViewportReservedWidthChange="setViewportReservedWidth"
    />
  </DataSource>
</template>

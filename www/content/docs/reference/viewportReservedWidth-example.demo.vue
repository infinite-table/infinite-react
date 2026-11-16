<script setup lang="ts">
import { ref } from 'vue';
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import type {
  InfiniteTablePropColumnSizing,
  InfiniteTableColumn,
} from '@infinite-table/infinite-vue';

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

const defaultColumnSizing: InfiniteTablePropColumnSizing = {
  country: { flex: 1 },
  city: { flex: 1 },
  salary: { flex: 2 },
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
  <div :style="{ color: 'var(--infinite-cell-color' }">
    <p>Current viewport reserved width: {{ viewportReservedWidth }}px.</p>

    <button
      :style="{
        padding: '5px',
        margin: '5px',
        border: '2px solid currentColor',
      }"
      @click="setViewportReservedWidth(0)"
    >
      Click to reset viewportReservedWidth to 0
    </button>
  </div>
  <DataSource :data="dataSource" primaryKey="id">
    <InfiniteTable
      debugId="viewportReservedWidth-example"
      :columns="columns"
      :columnDefaultWidth="50"
      :viewportReservedWidth="viewportReservedWidth"
      :onViewportReservedWidthChange="setViewportReservedWidth"
      :defaultColumnSizing="defaultColumnSizing"
    />
  </DataSource>
</template>

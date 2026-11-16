<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  InfiniteTable,
  DataSource,
  debounce,
} from '@infinite-table/infinite-vue';
import type {
  DataSourceData,
  InfiniteTablePropColumns,
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

const dataSource: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql?`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  preferredLanguage: { field: 'preferredLanguage' },
  country: { field: 'country' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  age: { field: 'age' },
  canDesign: { field: 'canDesign' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

const rgb = {
  r: 77,
  g: 149,
  b: 215,
};
const defaultColor = `#${rgb.r.toString(16)}${rgb.g.toString(
  16,
)}${rgb.b.toString(16)}`;

const color = ref({
  ...rgb,
});

const domProps = computed(() => {
  return {
    style: {
      '--infinite-active-cell-border-color--r': color.value.r,
      '--infinite-active-cell-border-color--g': color.value.g,
      '--infinite-active-cell-border-color--b': color.value.b,
      // for the same of the example being more obvious,
      // make the opacity of the unfocused table same as the one used on focus
      '--infinite-active-cell-background-alpha--table-unfocused': '0.25', // but this defaults to 0.1
    },
  };
});

const onColorChange = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;

  const r = parseInt(value.substr(1, 2), 16);
  const g = parseInt(value.substr(3, 2), 16);
  const b = parseInt(value.substr(5, 2), 16);

  color.value = {
    r,
    g,
    b,
  };
};
const onChange = debounce(onColorChange, { wait: 200 });
</script>

<template>
  <div
    :style="{
      color: 'var(--infinite-cell-color)',
    }"
  >
    Select color
    <!-- `.attr` sets the `value` attribute, which is the initial value of the input -->
    <input type="color" @input="onChange" :value.attr="defaultColor" />
  </div>
  <DataSource primaryKey="id" :data="dataSource">
    <InfiniteTable
      debugId="navigating-rows-theming-example"
      keyboardNavigation="row"
      :defaultActiveRowIndex="7"
      :domProps="domProps"
      :columns="columns"
    />
  </DataSource>
</template>

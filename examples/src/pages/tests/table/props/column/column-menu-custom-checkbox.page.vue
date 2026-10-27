<script setup lang="ts">
import { defineComponent, h } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type {
  DataSourceData,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  country: string;
  currency: string;
};

const dataSource: DataSourceData<Developer> = () => {
  return [
    { id: 1, firstName: 'John', country: 'USA', currency: 'USD' },
    { id: 2, firstName: 'Bill', country: 'USA', currency: 'USD' },
    { id: 3, firstName: 'Nat', country: 'Canada', currency: 'CAD' },
  ];
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  country: { field: 'country' },
  currency: { field: 'currency' },
};

const CustomCheckBox = defineComponent({
  name: 'CustomCheckBox',
  props: {
    checked: { type: Boolean, default: null },
    disabled: Boolean,
    onChange: Function,
  },
  setup(props) {
    return () =>
      h('input', {
        type: 'checkbox',
        'data-name': 'custom-checkbox',
        checked: !!props.checked,
        disabled: props.disabled,
        onChange: (event: Event) =>
          props.onChange?.((event.target as HTMLInputElement).checked),
      });
  },
});

const components = {
  CheckBox: CustomCheckBox as any,
};

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};
</script>

<template>
  <DataSource primaryKey="id" :data="dataSource">
    <InfiniteTable
      :domProps="domProps"
      :columnDefaultWidth="140"
      :columns="columns"
      :components="components"
    />
  </DataSource>
</template>

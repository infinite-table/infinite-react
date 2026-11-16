<script setup lang="ts">
import { defineComponent, h } from 'vue';
import {
  InfiniteTable,
  DataSource,
  components,
  useInfiniteColumnFilterEditor,
} from '@infinite-table/infinite-vue';
import type {
  DataSourcePropFilterTypes,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-vue';

const { CheckBox } = components;

type Developer = {
  id: number;
  firstName: string;
  canDesign: boolean;
  stack: string;
  hobby: string;
};
const dataSource: Developer[] = [
  {
    id: 1,
    firstName: 'John',

    canDesign: true,
    stack: 'frontend',
    hobby: 'gaming',
  },
  {
    id: 2,
    firstName: 'Jane',

    canDesign: false,
    stack: 'backend',
    hobby: 'reading',
  },
  {
    id: 3,
    firstName: 'Jack',

    canDesign: true,
    stack: 'frontend',
    hobby: 'gaming',
  },
  {
    id: 4,
    firstName: 'Jill',

    canDesign: false,
    stack: 'backend',
    hobby: 'reading',
  },
  {
    id: 5,
    firstName: 'Seb',

    canDesign: false,
    stack: 'backend',
    hobby: 'reading',
  },
];

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    type: 'number',
    defaultWidth: 100,
  },
  canDesign: {
    field: 'canDesign',
    filterType: 'bool',
    renderValue: ({ value }) => (value ? 'Yes' : 'No'),
  },
  firstName: {
    field: 'firstName',
  },
  stack: { field: 'stack' },
};

const domProps = {
  style: {
    height: '100%',
  },
};

const BoolFilterEditor = defineComponent({
  setup() {
    const { value, setValue, className } =
      useInfiniteColumnFilterEditor<Developer>();

    return () =>
      h('div', { class: className, style: { textAlign: 'center' } }, [
        h(CheckBox, {
          checked: value.value,
          onChange: (newValue) => {
            if (value.value === true) {
              // after the value was true, make it go to indeterminate state
              newValue = null;
            }
            if (value.value === null) {
              // from indeterminate, goto false
              newValue = false;
            }
            setValue(newValue);
          },
        }),
      ]);
  },
});

const filterTypes: DataSourcePropFilterTypes<Developer> = {
  bool: {
    defaultOperator: 'eq',
    emptyValues: [null],
    components: {
      FilterEditor: BoolFilterEditor as any,
      FilterOperatorSwitch: () => null,
    },
    operators: [
      {
        name: 'eq',
        label: 'Equals',
        fn: ({ currentValue, filterValue }) => currentValue === filterValue,
      },
    ],
  },
};
</script>

<template>
  <DataSource
    :data="dataSource"
    primaryKey="id"
    :defaultFilterValue="[]"
    :filterDelay="0"
    :filterTypes="filterTypes"
  >
    <InfiniteTable
      debugId="checkbox-filter-editor-example"
      :domProps="domProps"
      :columnDefaultWidth="150"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>

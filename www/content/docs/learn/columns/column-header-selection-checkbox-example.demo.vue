<script setup lang="ts">
import { h } from 'vue';
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import type {
  InfiniteTableProps,
  InfiniteTablePropColumns,
  DataSourceProps,
} from '@infinite-table/infinite-vue';

const columns: InfiniteTablePropColumns<Developer> = {
  country: {
    field: 'country',
  },
  firstName: {
    field: 'firstName',
    defaultHiddenWhenGroupedBy: '*',
  },
  stack: {
    renderSelectionCheckBox: true,
    renderHeaderSelectionCheckBox: ({ renderBag }) => {
      // render the default value and decorate it
      return h('b', ['[', renderBag.selectionCheckBox, ']']);
    },
    field: 'stack',
  },
  age: { field: 'age' },
  id: { field: 'id' },
  preferredLanguage: {
    field: 'preferredLanguage',
  },
  canDesign: {
    field: 'canDesign',
  },
};

const defaultGroupBy: DataSourceProps<Developer>['groupBy'] = [
  {
    field: 'canDesign',
  },
  {
    field: 'stack',
  },
  {
    field: 'preferredLanguage',
  },
];

const groupColumn: InfiniteTableProps<Developer>['groupColumn'] = {
  field: 'firstName',
  renderHeaderSelectionCheckBox: ({ renderBag }) => {
    // render the default value and decorate it
    return h('b', ['[', renderBag.selectionCheckBox, ']']);
  },
  defaultWidth: 300,
};

const domProps = {
  style: {
    flex: 1,
    minHeight: '500px',
  },
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};
</script>

<template>
  <DataSource
    :data="dataSource"
    :groupBy="defaultGroupBy"
    selectionMode="multi-row"
    primaryKey="id"
  >
    <InfiniteTable
      debugId="column-header-selection-checkbox-example"
      :columns="columns"
      :domProps="domProps"
      :groupColumn="groupColumn"
      :columnDefaultWidth="150"
    />
  </DataSource>
</template>

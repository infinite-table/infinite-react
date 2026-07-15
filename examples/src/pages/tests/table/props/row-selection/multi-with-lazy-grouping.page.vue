<script setup lang="ts">
import { ref } from 'vue';

import {
  DataSource,
  InfiniteTable,
  GroupRowsState,
  RowSelectionState,
  components,
} from '@infinite-table/infinite-vue';

const { CheckBox } = components;

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

const DATA_SOURCE_SIZE = '100';

const dataSource = ({
  pivotBy,
  aggregationReducers,
  groupBy,

  groupKeys = [],
}: any) => {
  const args = [
    pivotBy
      ? 'pivotBy=' +
        JSON.stringify(pivotBy.map((p: any) => ({ field: p.field })))
      : null,
    `groupKeys=${JSON.stringify(groupKeys)}`,
    groupBy
      ? 'groupBy=' +
        JSON.stringify(groupBy.map((p: any) => ({ field: p.field })))
      : null,
    aggregationReducers
      ? 'reducers=' +
        JSON.stringify(
          Object.keys(aggregationReducers).map((key) => ({
            field: aggregationReducers[key].field,
            id: key,
            name: aggregationReducers[key].reducer,
          })),
        )
      : null,
  ]
    .filter(Boolean)
    .join('&');
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL +
      `/developers${DATA_SOURCE_SIZE}-sql?` +
      args,
  )
    .then((r) => r.json())
    .then((data: Developer[]) => data)
    .then((data) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(data);
        }, 2);
      });
    });
};

const columns: Record<string, any> = {
  id: { field: 'id' },

  firstName: {
    field: 'firstName',
  },

  preferredLanguage: {
    field: 'preferredLanguage',
  },
  stack: {
    field: 'stack',
  },
};

const domProps = {
  style: {
    height: '80vh',
  },
};

const groupBy = [
  { field: 'stack' as const },
  {
    field: 'preferredLanguage' as const,
  },
  {
    field: 'canDesign' as const,
  },
];

const groupColumn = {
  field: 'firstName' as const,
};

const groupRowsState = new GroupRowsState({
  expandedRows: true,
  collapsedRows: [],
});

const rowSelection = ref<any>({
  defaultSelection: false,
  selectedRows: [],
});

const selectedCount = (sel: any) =>
  sel instanceof RowSelectionState ? sel.getSelectedCount() : false;
</script>

<template>
  <div>
    <CheckBox :checked="null" />test Selected
    {{ selectedCount(rowSelection) }}
  </div>

  <DataSource
    primaryKey="id"
    :data="dataSource"
    :groupBy="groupBy"
    :lazyLoad="true"
    :defaultGroupRowsState="groupRowsState"
    selectionMode="multi-row"
    :defaultRowSelection="rowSelection"
    :useGroupKeysForMultiRowSelection="true"
  >
    <InfiniteTable
      :domProps="domProps"
      :columns="columns"
      keyboardNavigation="row"
      groupRenderStrategy="single-column"
      :hideColumnWhenGrouped="true"
      :groupColumn="groupColumn"
      :columnDefaultWidth="300"
    />
  </DataSource>
</template>

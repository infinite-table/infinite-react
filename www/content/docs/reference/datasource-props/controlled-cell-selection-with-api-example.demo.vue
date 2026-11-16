<script setup lang="ts">
import { ref, shallowRef } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import type {
  InfiniteTablePropColumns,
  DataSourcePropCellSelection_MultiCell,
  InfiniteTableApi,
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

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 60 },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
  country: { field: 'country' },
  age: { field: 'age', type: 'number' },
  salary: { field: 'salary', type: 'number' },
  currency: { field: 'currency', type: 'number' },
};

const cellSelection = ref<DataSourcePropCellSelection_MultiCell>({
  defaultSelection: false,
  selectedCells: [
    [3, 'stack'],
    [0, 'firstName'],
  ],
});

const setCellSelection = (value: DataSourcePropCellSelection_MultiCell) => {
  cellSelection.value = value;
};

const api = shallowRef<InfiniteTableApi<Developer> | null>();

const onReady = ({ api: tableApi }: { api: InfiniteTableApi<Developer> }) => {
  api.value = tableApi;
};
</script>

<template>
  <div
    :style="{
      display: 'flex',
      flex: 1,
      color: 'var(--infinite-cell-color)',
      flexFlow: 'column',
      background: 'var(--infinite-background)',
    }"
  >
    <button
      :style="{
        margin: '10px',
        padding: '10px',
        borderRadius: '5px',
        border: '2px solid magenta',
      }"
      @click="api?.cellSelectionApi.selectColumn('firstName')"
    >
      Select "firstName" column
    </button>
    <div
      :style="{
        maxHeight: '200px',
        overflow: 'auto',
        border: '2px solid magenta',
      }"
    >
      Current selection:
      <pre>{{ JSON.stringify(cellSelection, null, 2) }}</pre>
    </div>

    <DataSource
      primaryKey="id"
      :data="dataSource"
      :cellSelection="cellSelection"
      :onCellSelectionChange="setCellSelection"
      selectionMode="multi-cell"
    >
      <InfiniteTable
        debugId="controlled-cell-selection-with-api-example"
        :columns="columns"
        :columnDefaultWidth="100"
        :onReady="onReady"
      />
    </DataSource>
  </div>
</template>

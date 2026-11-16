<script setup lang="ts">
import { shallowRef } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import type {
  DataSourceApi,
  DataSourceData,
  InfiniteTablePropColumns,
  InfiniteTablePropGetCellContextMenuItems,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  salary: number;
};

const data: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql?`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    type: 'number',
    defaultWidth: 100,
  },
  salary: {
    defaultFilterable: true,
    field: 'salary',
    type: 'number',
  },

  firstName: {
    field: 'firstName',
    renderValue: ({ rowInfo, value }) => {
      return `${value} ${rowInfo.rowDisabled ? '🚫' : ''}`;
    },
  },
  stack: { field: 'stack' },
  currency: { field: 'currency' },
};

const dataSourceApi = shallowRef<DataSourceApi<Developer>>();

const setDataSourceApi = (api: DataSourceApi<Developer>) => {
  dataSourceApi.value = api;
};

const getCellContextMenuItems: InfiniteTablePropGetCellContextMenuItems<
  Developer
> = ({ rowInfo }, { dataSourceApi }) => {
  return {
    columns: [{ name: 'label' }],
    items: [
      {
        label: 'Disable row',
        key: 'disable-row',
        disabled: rowInfo.rowDisabled,
        onAction: ({ hideMenu }) => {
          dataSourceApi.setRowEnabledAt(rowInfo.indexInAll, false);
          hideMenu();
        },
      },
      {
        label: 'Enable row',
        key: 'enable-row',
        disabled: !rowInfo.rowDisabled,
        onAction: ({ hideMenu }) => {
          dataSourceApi.setRowEnabled(rowInfo.id, true);
          hideMenu();
        },
      },
      {
        label: 'Toggle row disable/enable',
        key: 'toggle-row-disable-enable',
        onAction: ({ hideMenu }) => {
          dataSourceApi.setRowEnabled(rowInfo.id, rowInfo.rowDisabled);
          hideMenu();
        },
      },
    ],
  };
};
</script>

<template>
  <button @click="dataSourceApi?.enableAllRows()">Enable all rows</button>
  <button @click="dataSourceApi?.disableAllRows()">Disable all rows</button>
  <DataSource
    :onReady="setDataSourceApi"
    :data="data"
    primaryKey="id"
    :defaultRowDisabledState="{
      enabledRows: [1, 2, 3, 5],
      disabledRows: true,
    }"
  >
    <InfiniteTable
      debugId="using-api-to-disable-rows-example"
      :getCellContextMenuItems="getCellContextMenuItems"
      :columnDefaultWidth="120"
      :columnMinWidth="50"
      :columns="columns"
      keyboardNavigation="row"
    />
  </DataSource>
</template>

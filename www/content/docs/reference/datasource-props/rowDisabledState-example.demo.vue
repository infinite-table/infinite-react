<script setup lang="ts">
import { ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import type {
  DataSourceData,
  DataSourceProps,
  InfiniteTablePropColumns,
  InfiniteTablePropGetCellContextMenuItems,
  RowDisabledStateObject,
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
  },
  stack: { field: 'stack' },
  currency: { field: 'currency' },
};

const rowDisabledState = ref<RowDisabledStateObject<number>>({
  enabledRows: true,
  disabledRows: [1, 3, 4, 5],
});

const onRowDisabledStateChange: DataSourceProps<Developer>['onRowDisabledStateChange'] =
  (rowState) => {
    rowDisabledState.value = rowState.getState() as RowDisabledStateObject<number>;
  };

const getCellContextMenuItems: InfiniteTablePropGetCellContextMenuItems<
  Developer
> = ({ rowInfo }, { dataSourceApi }) => {
  const rowDisabled = dataSourceApi.isRowDisabledAt(rowInfo.indexInAll);
  return {
    columns: [{ name: 'label' }],
    items: [
      {
        label: 'Disable row',
        disabled: rowDisabled,
        key: 'disable-row',
        onAction: ({ hideMenu }) => {
          dataSourceApi.setRowEnabledAt(rowInfo.indexInAll, false);
          hideMenu();
        },
      },
      {
        label: 'Enable row',
        disabled: !rowDisabled,
        key: 'enable-row',
        onAction: ({ hideMenu }) => {
          dataSourceApi.setRowEnabled(rowInfo.id, true);
          hideMenu();
        },
      },
      {
        label: 'Toggle row enable/disable',
        key: 'toggle-row',
        onAction: ({ hideMenu }) => {
          dataSourceApi.setRowEnabled(
            rowInfo.id,
            dataSourceApi.isRowDisabled(rowInfo.id),
          );
          hideMenu();
        },
      },
    ],
  };
};
</script>

<template>
  <DataSource
    :data="data"
    primaryKey="id"
    :rowDisabledState="rowDisabledState"
    :onRowDisabledStateChange="onRowDisabledStateChange"
  >
    <InfiniteTable
      debugId="rowDisabledState-example"
      :getCellContextMenuItems="getCellContextMenuItems"
      keyboardNavigation="row"
      :columnDefaultWidth="120"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>

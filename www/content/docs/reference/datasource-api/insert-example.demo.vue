<script setup lang="ts">
import { ref, shallowRef } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import type {
  DataSourceApi,
  InfiniteTableApi,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;

  firstName: string;
  lastName: string;

  currency: string;
  salary: number;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  age: number;
  reposCount: number;
};

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const CURRENCIES = ['USD', 'CAD', 'EUR'];
const stacks = ['frontend', 'backend', 'fullstack'];

let ID = 0;

const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Mike', 'Molly'];
const lastNames = ['Smith', 'Doe', 'Johnson', 'Williams', 'Brown', 'Jones'];
const getRow = (count?: number): Developer => {
  return {
    id: ID++,
    firstName:
      ID === 1
        ? 'ROCKY'
        : firstNames[getRandomInt(0, firstNames.length - 1)] +
          (count ? ` ${count}` : ''),
    lastName: lastNames[getRandomInt(0, firstNames.length - 1)],

    currency: CURRENCIES[getRandomInt(0, 2)],
    salary: getRandomInt(1000, 10000),
    preferredLanguage: 'JavaScript',
    stack: stacks[getRandomInt(0, 2)],
    canDesign: getRandomInt(0, 1) === 0 ? 'yes' : 'no',
    age: getRandomInt(20, 100),
    reposCount: getRandomInt(0, 100),
  };
};

const dataSource: Developer[] = [...Array(10)].map(getRow);

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: {
    field: 'firstName',
  },
  age: {
    field: 'age',
    type: 'number',
    style: ({ value, rowInfo }) => {
      if (rowInfo.isGroupRow) {
        return {};
      }

      return {
        color: 'black',
        background:
          value > 80
            ? 'tomato'
            : value > 60
            ? 'orange'
            : value > 40
            ? 'yellow'
            : value > 20
            ? 'lightgreen'
            : 'green',
      };
    },
  },
  salary: {
    field: 'salary',
    type: 'number',
  },
  reposCount: {
    field: 'reposCount',
    type: 'number',
  },

  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
};

const domProps = {
  style: {
    height: '100%',
  },
};

const buttonStyle = {
  border: '2px solid magenta',
  color: 'var(--infinite-cell-color)',
  background: 'var(--infinite-background)',
};

const apis = shallowRef<{
  api: InfiniteTableApi<Developer>;
  dataSourceApi: DataSourceApi<Developer>;
}>();

const onReady = (value: {
  api: InfiniteTableApi<Developer>;
  dataSourceApi: DataSourceApi<Developer>;
}) => {
  apis.value = value;
};

const currentActivePrimaryKey = ref<string>('');

const addRowAfterRocky = () => {
  if (apis.value) {
    const dataSourceApi = apis.value.dataSourceApi!;
    dataSourceApi.insertData(getRow(dataSourceApi.getRowInfoArray().length), {
      primaryKey: 0,
      position: 'after',
    });
  }
};

const addRowAfterActiveRow = () => {
  if (apis.value) {
    const dataSourceApi = apis.value.dataSourceApi!;
    dataSourceApi.insertData(getRow(dataSourceApi.getRowInfoArray().length), {
      primaryKey: currentActivePrimaryKey.value,
      position: 'after',
    });
  }
};

const onActiveRowIndexChange = (rowIndex: number) => {
  if (apis.value) {
    const id = apis.value.dataSourceApi.getRowInfoArray()[rowIndex].id;

    currentActivePrimaryKey.value = id;
  }
};
</script>

<template>
  <button :style="buttonStyle" @click="addRowAfterRocky">
    Add row after Rocky
  </button>
  <button
    :style="buttonStyle"
    :disabled="!currentActivePrimaryKey"
    @click="addRowAfterActiveRow"
  >
    Add row after currently active row
  </button>
  <DataSource :data="dataSource" primaryKey="id">
    <InfiniteTable
      debugId="insert-example"
      :domProps="domProps"
      :onReady="onReady"
      :columnDefaultWidth="130"
      :columnMinWidth="50"
      :columns="columns"
      keyboardNavigation="row"
      :onActiveRowIndexChange="onActiveRowIndexChange"
    />
  </DataSource>
</template>

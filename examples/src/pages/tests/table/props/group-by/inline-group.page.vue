<script setup lang="ts">
import { computed, ref } from 'vue';

import {
  DataSource,
  InfiniteTable,
  GroupRowsState,
} from '@infinite-table/infinite-vue';

import { data } from './pivotData';

const domProps = {
  style: {
    height: '60vh',
    border: '1px solid gray',
    width: 'calc(100% - 20px)',
    marginLeft: '10px',
  },
};

const formatter = new Intl.NumberFormat();
const groupBy = [
  {
    field: 'department' as const,
  },
  {
    field: 'team' as const,
  },
];

const sum = (acc: number, sum: number) => acc + sum;

const sumReducer = {
  initialValue: 0,
  getter: (data: any) => data.salary,
  reducer: sum,
};

const reducers = {
  salary: { field: 'salary' as const, ...sumReducer },
};

const groupColumn = {
  defaultWidth: 300,
};

const groupRowsState = new GroupRowsState({
  collapsedRows: [['it', 'components']],

  expandedRows: true,
});

const groupOptions = ['multi-column', 'single-column'];

const groupRenderStrategy = ref<any>('single-column');

const hideEmptyGroupColumns = ref(true);

const columns = computed<Record<string, any>>(() => {
  return {
    department: {
      field: 'department',
      valueFormatter:
        groupRenderStrategy.value === 'inline'
          ? ({ rowInfo }: { rowInfo: any }) => {
              if (!rowInfo.isGroupRow) {
                return null;
              }
              const { groupBy, parents } = rowInfo;

              const indexOfDepartment =
                groupBy?.findIndex((g: any) => g.field === 'department') ?? -1;
              const groupData = parents?.[indexOfDepartment] || rowInfo;

              return `${groupData?.value} (${
                groupData?.groupCount
              }), total ${' '} ${formatter.format(
                groupData?.reducerResults?.salary as any as number,
              )}`;
            }
          : undefined,
    },
    team: {
      field: 'team',
    },
    id: { field: 'id' },
    name: { field: 'name' },
    country: { field: 'country' },

    salary: {
      field: 'salary',

      render: ({ value }: { value: any }) =>
        value ? `$ ${formatter.format(value as any as number)}` : null,
    },
  };
});

const defaultColumnSizing = {
  id: { width: 70 },
  name: { width: 100 },
  country: { width: 120 },
};

const onStrategyChange = (event: Event) => {
  const value = (event.target as HTMLInputElement).value as any;
  groupRenderStrategy.value = value;

  hideEmptyGroupColumns.value =
    value === 'single-column' ? false : hideEmptyGroupColumns.value;
};

const toggleHide = () => {
  hideEmptyGroupColumns.value = !hideEmptyGroupColumns.value;
};
</script>

<template>
  <div :style="{ fontSize: '16px' }">
    <p :style="{ padding: '10px' }">
      Choose group render strategy:
      <div
        :style="{
          display: 'flex',
          flexFlow: 'column',
          alignItems: 'flex-start',
        }"
      >
        <label
          v-for="option in groupOptions"
          :key="option"
          :style="{ padding: '5px', cursor: 'pointer' }"
        >
          <input
            @change="onStrategyChange"
            :style="{ marginRight: '10px' }"
            type="radio"
            name="groupRenderStrategy"
            :value="option"
            :checked="groupRenderStrategy === option"
          />
          {{ option }}
        </label>
      </div>
    </p>
    <p :style="{ padding: '10px' }">
      Hide empty group columns:
      <input
        :disabled="groupRenderStrategy === 'single-column'"
        type="checkbox"
        :checked="hideEmptyGroupColumns"
        @change="toggleHide"
      />
    </p>
    <DataSource
      primaryKey="id"
      :data="data"
      :groupBy="groupBy"
      :defaultGroupRowsState="groupRowsState"
      :aggregationReducers="reducers"
    >
      <InfiniteTable
        :domProps="domProps"
        :columns="columns"
        :defaultColumnSizing="defaultColumnSizing"
        :columnDefaultWidth="280"
        :groupColumn="groupColumn"
        :hideEmptyGroupColumns="hideEmptyGroupColumns"
        :groupRenderStrategy="groupRenderStrategy"
      />
    </DataSource>
  </div>
</template>

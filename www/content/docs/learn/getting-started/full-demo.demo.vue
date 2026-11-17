<script setup lang="ts">
import '@infinite-table/infinite-vue/index.css';

import { computed, h, ref } from 'vue';
import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
  components,
  type InfiniteTablePropColumnTypes,
  type DataSourcePropRowSelection_MultiRow,
  type InfiniteTableColumn,
  type InfiniteTableColumnRenderValueParam,
  type DataSourcePropAggregationReducers,
  type DataSourceGroupBy,
  type DataSourcePropFilterValue,
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

const avgReducer = {
  initialValue: 0,
  reducer: (acc: number, sum: number) => acc + sum,
  done: (value: number, arr: any[]) =>
    arr.length ? Math.floor(value / arr.length) : 0,
};
const aggregationReducers: DataSourcePropAggregationReducers<Developer> = {
  salary: {
    field: 'salary',
    ...avgReducer,
  },
  age: {
    field: 'age',
    ...avgReducer,
  },
  currency: {
    field: 'currency',
    initialValue: new Set<string>(),
    reducer: (acc: Set<string>, value: string) => {
      acc.add(value);
      return acc;
    },
    done: (value: Set<string>) => {
      return value.size > 1 ? 'Mixed' : value.values().next().value;
    },
  },
  canDesign: {
    field: 'canDesign',
    initialValue: false,
    reducer: (acc: boolean | null, value: 'yes' | 'no') => {
      if (acc === null) {
        return acc;
      }
      if (acc === false && value === 'yes') {
        return null;
      }
      if (acc === true && value === 'no') {
        return null;
      }
      return acc;
    },
  },
};

const flags: Record<string, string> = {
  'United States': '🇺🇸',
  Canada: '🇨🇦',
  France: '🇫🇷',
  Germany: '🇩🇪',
  'United Kingdom': '🇬🇧',
  'South Africa': '🇿🇦',
  'New Zealand': '🇳🇿',
  Sweden: '🇸🇪',
  China: '🇨🇳',
  Brazil: '🇧🇷',
  Turkey: '🇹🇷',
  Italy: '🇮🇹',
  India: '🇮🇳',
  Indonesia: '🇮🇩',
  Japan: '🇯🇵',
  Argentina: '🇦🇷',
  'Saudi Arabia': '🇸🇦',
  Mexico: '🇲🇽',
  'United Arab Emirates': '🇦🇪',
};

// the min and max salary of the current rows, for the heatmap background
const salaryRange = ref({ min: 0, max: 0 });

const onDataArrayChange = (data: Developer[]) => {
  const salaries = data.map((developer) => developer.salary ?? 0);
  salaryRange.value = {
    min: Math.min(...salaries),
    max: Math.max(...salaries),
  };
};

// the columns are recomputed when the salary range changes
const columns = computed<Record<string, InfiniteTableColumn<Developer>>>(
  () => {
    const { min, max } = salaryRange.value;
    return {
      age: {
        field: 'age',
        header: 'Age',
        type: 'number',
        defaultWidth: 100,
        renderValue: ({ value }) => value,
      },
      salary: {
        header: 'Compensation',
        field: 'salary',
        type: 'number',
        defaultWidth: 210,
        render: ({ renderBag, value }) => {
          const percentage = ((value - min) / Math.abs(max - min)) * 100;
          const alpha = Number((percentage / 100).toPrecision(2)) + 0.2;

          return h(
            'div',
            {
              style: {
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                inset: 0,
                backgroundColor: `rgba(255, 0, 0, ${alpha})`,
              },
            },
            [renderBag.all],
          );
        },
      },
      currency: { field: 'currency', header: 'Currency', defaultWidth: 100 },
      preferredLanguage: {
        field: 'preferredLanguage',
        header: 'Programming Language',
      },
      canDesign: {
        defaultWidth: 135,
        field: 'canDesign',
        header: 'Design Skills',
        renderMenuIcon: false,
        renderValue: ({ value }) =>
          h('div', { style: { display: 'flex', alignItems: 'center' } }, [
            h(CheckBox, {
              defaultChecked: value === null ? null : value === 'yes',
              domProps: { style: { marginRight: '10px' } },
            }),
            value === null ? 'Some' : value === 'yes' ? 'Yes' : 'No',
          ]),
      },
      country: {
        field: 'country',
        header: 'Country',
        renderValue: ({ value }) =>
          h('span', `${flags[value] ?? ''} ${value}`),
      },
      firstName: { field: 'firstName', header: 'First Name' },
      stack: { field: 'stack', header: 'Stack' },
      city: { field: 'city', header: 'City' },
    };
  },
);

const groupColumn: InfiniteTableColumn<Developer> = {
  header: 'Grouping',
  field: 'firstName',
  defaultWidth: 250,
  renderSelectionCheckBox: true,
  defaultFilterable: false,

  // in this function we have access to collapsed info
  // and grouping info about the current row - see rowInfo.groupBy
  renderValue: ({
    value,
    rowInfo,
  }: InfiniteTableColumnRenderValueParam<Developer>) => {
    if (!rowInfo.isGroupRow) {
      return value;
    }
    const groupBy = rowInfo.groupBy || [];
    const collapsed = rowInfo.collapsed;
    const currentGroupBy = groupBy[groupBy.length - 1];

    if (currentGroupBy?.field === 'age') {
      return `🥳 ${value}${collapsed ? ' 🤷‍♂️' : ''}`;
    }

    return `${value}`;
  },
};

const defaultGroupRowsState = new GroupRowsState({
  // make all groups collapsed by default
  collapsedRows: true,
  expandedRows: [
    ['United States'],
    ['United States', 'backend'],
    ['France'],
    ['Turkey'],
  ],
});

const columnTypes: InfiniteTablePropColumnTypes<Developer> = {
  number: {
    align: 'end',
    renderValue: ({ value, data, rowInfo }) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency:
          rowInfo.isGroupRow && rowInfo.data?.currency === 'Mixed'
            ? 'USD'
            : data?.currency || 'USD',
      }).format(value);
    },
  },
};

const defaultRowSelection: DataSourcePropRowSelection_MultiRow = {
  selectedRows: [['United States'], ['India'], ['France'], ['Turkey']],
  deselectedRows: [['United States', 'frontend']],
  defaultSelection: false,
};

const defaultFilterValue: DataSourcePropFilterValue<Developer> = [
  {
    field: 'age',
    filter: {
      operator: 'gt',
      type: 'number',
      value: null,
    },
  },
];

const groupBy: DataSourceGroupBy<Developer>[] = [
  { field: 'country' },
  { field: 'stack' },
];

const domProps = {
  style: {
    minHeight: '50vh',
    height: '600px',
    margin: '5px',
  },
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};
</script>

<template>
  <DataSource
    :data="dataSource"
    primaryKey="id"
    :defaultFilterValue="defaultFilterValue"
    :useGroupKeysForMultiRowSelection="true"
    :defaultRowSelection="defaultRowSelection"
    :defaultSortInfo="{ dir: -1, field: 'country' }"
    :onDataArrayChange="onDataArrayChange"
    :defaultGroupRowsState="defaultGroupRowsState"
    :aggregationReducers="aggregationReducers"
    :groupBy="groupBy"
  >
    <InfiniteTable
      debugId="full-demo"
      groupRenderStrategy="single-column"
      :defaultColumnPinning="{ 'group-by': true }"
      :domProps="domProps"
      :defaultActiveRowIndex="0"
      :groupColumn="groupColumn"
      :columns="columns"
      :columnTypes="columnTypes"
      :columnDefaultWidth="150"
    />
  </DataSource>
</template>

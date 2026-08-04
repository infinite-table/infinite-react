<script setup lang="ts">
import { computed, h, ref } from 'vue';

import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
  components,
} from '@infinite-table/infinite-vue';

import type {
  InfiniteTableColumn,
  DataSourcePropAggregationReducers,
  DataSourceGroupBy,
  DataSourcePropRowSelection_MultiRow,
  DataSourcePropFilterValue,
  InfiniteTablePropColumnTypes,
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

const flags = {
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
function getColumns(): Record<string, InfiniteTableColumn<Developer>> {
  return {
    age: {
      field: 'age',
      header: 'Age',
      type: 'number',
      defaultWidth: 100,
      renderValue: ({ value }) => value,
    },
    salary: {
      field: 'salary',
      type: 'number',
      defaultWidth: 210,
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
      renderValue: ({ value }: { value: any }) => {
        return h(
          'div',
          { style: { display: 'flex', alignItems: 'center' } },
          [
            h(CheckBox as any, {
              defaultChecked: value === null ? null : value === 'yes',
              domProps: {
                style: {
                  marginRight: '10px',
                },
              },
            }),
            value === null ? 'Some' : value === 'yes' ? 'Yes' : 'No',
          ],
        );
      },
    },
    country: {
      field: 'country',
      header: 'Country',
      renderValue: ({ value }: { value: any }) => {
        return h('span', [(flags as any)[value] || '', ' ', value]);
      },
    },
    firstName: { field: 'firstName', header: 'First Name' },
    stack: { field: 'stack', header: 'Stack' },

    city: {
      field: 'city',
      header: 'City',
      renderHeader: ({ column }: { column: any }) =>
        `${column.computedVisibleIndex} City`,
    },
  };
}

// 250+100+210+100+150+135+150+150+150+150
// → 123.456,789
const groupColumn: InfiniteTableColumn<Developer> = {
  header: 'Grouping',
  field: 'firstName',
  defaultWidth: 250,
  renderSelectionCheckBox: true,
  defaultFilterable: false,

  // in this function we have access to collapsed info
  // and grouping info about the current row - see rowInfo.groupBy
  renderValue: ({ value, rowInfo }: { value: any; rowInfo: any }) => {
    if (!rowInfo.isGroupRow) {
      return `${rowInfo.indexInAll} ${rowInfo.id} ${value}`;
    }
    const groupBy = rowInfo.groupBy || [];
    const collapsed = rowInfo.collapsed;
    const currentGroupBy = groupBy[groupBy.length - 1];

    if (currentGroupBy?.field === 'age') {
      return `🥳 ${value}${collapsed ? ' 🤷‍♂️' : ''}`;
    }

    return `${rowInfo.indexInAll} ${value}`;
  },
};

const defaultGroupRowsState = new GroupRowsState({
  //make all groups collapsed by default
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
    style: () => {
      return {};
    },
    renderValue: ({ value, data, rowInfo }) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency:
          rowInfo.isGroupRow && (rowInfo as any).data?.currency === 'Mixed'
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

const domProps = {
  style: {
    minHeight: '50vh',
    width: '100vw',
    // width: 575,
    marginTop: '200px',
  },
};

const minMax = ref({ min: 0, max: 0 });

const columns = computed(() => {
  const { min, max } = minMax.value;
  const cols = getColumns();

  if (cols.salary) {
    cols.salary.render = ({ renderBag, value }: any) => {
      const increase: number = Math.abs(max - min);
      const percentage = ((value - min) / increase) * 100;
      const alpha = Number((percentage / 100).toPrecision(2)) + 0.2;

      const backgroundColor = `rgba(255, 0, 0, ${alpha})`;
      return h(
        'div',
        {
          style: {
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor,
          },
        },
        renderBag.all,
      );
    };
  }

  return cols;
});

const groupBy: DataSourceGroupBy<Developer>[] = [
  {
    field: 'country',
  },
  { field: 'stack' },
];

const onDataArrayChange = (data: Developer[]) => {
  const min = Math.min(...data.map((data) => data.salary ?? 0));
  const max = Math.max(...data.map((data) => data.salary ?? 0));

  minMax.value = { min, max };
};

const defaultColumnPinning = {
  'group-by': true,
};

const licenseKey = process.env.NEXT_PUBLIC_INFINITE_LICENSE_KEY;

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
    filterMode="local"
    :useGroupKeysForMultiRowSelection="true"
    :defaultRowSelection="defaultRowSelection"
    :onDataArrayChange="onDataArrayChange"
    :defaultGroupRowsState="defaultGroupRowsState"
    :aggregationReducers="aggregationReducers"
    :groupBy="groupBy"
  >
    <InfiniteTable
      groupRenderStrategy="single-column"
      :defaultColumnPinning="defaultColumnPinning"
      :domProps="domProps"
      :defaultActiveRowIndex="0"
      :groupColumn="groupColumn"
      :licenseKey="licenseKey"
      :columns="columns"
      :columnTypes="columnTypes"
      :columnDefaultWidth="150"
    />
  </DataSource>
</template>

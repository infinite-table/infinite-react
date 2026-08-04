<script setup lang="ts">
import { defineComponent, h } from 'vue';

import styles from './default.module.css';

import {
  InfiniteTable,
  DataSource,
  useDataSourceContext,
  useInfiniteHeaderCell,
  useGetMasterDetailContextForVue,
} from '@infinite-table/infinite-vue';

import type {
  InfiniteTablePropColumns,
  DataSourceProps,
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
  streetName: string;
  streetNo: number;
  streetPrefix: string;
};

const HeaderWithCount = defineComponent({
  name: 'HeaderWithCount',
  setup() {
    const dataSourceContext = useDataSourceContext<Developer>();
    const headerCell = useInfiniteHeaderCell<Developer>();

    return () => {
      const length = dataSourceContext.state.value.dataArray.length;
      const { column } = headerCell.value;
      return h('div', `${column.id} ${length}`);
    };
  },
});

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    renderHeader: () => {
      return h(HeaderWithCount);
    },
  },

  firstName: { field: 'firstName' },
  age: {
    field: 'age',
    type: ['number'],
  },
  salary: {
    field: 'salary',
    type: ['number', 'currency'],
    style: {
      color: 'red',
    },
    renderRowDetailIcon: true,
  },

  canDesign: { field: 'canDesign' },
  preferredLanguage: { field: 'preferredLanguage' },
  city: { field: 'city' },
  lastName: { field: 'lastName' },
  hobby: { field: 'hobby' },
  stack: { field: 'stack' },
  streetName: { field: 'streetName' },
  currency: { field: 'currency' },
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const detailDataSource: DataSourceProps<Developer>['data'] = ({
  sortInfo,
  filterValue,
  masterRowInfo,
}) => {
  if (sortInfo && !Array.isArray(sortInfo)) {
    sortInfo = [sortInfo];
  }
  console.log(masterRowInfo?.data, 'master');

  const args = [
    filterValue
      ? 'filterBy=' +
        JSON.stringify(
          filterValue.map(({ field, filter }) => {
            return {
              field: field,
              value: filter.value,
              operator: filter.operator,
            };
          }),
        )
      : null,
    sortInfo
      ? 'sortInfo=' +
        JSON.stringify(
          sortInfo.map((s: any) => ({
            field: s.field,
            dir: s.dir,
          })),
        )
      : null,
  ]
    .filter(Boolean)
    .join('&');

  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers10-sql?' + args)
    .then((r) => r.json())
    .then((response: { data: Developer[] }) => {
      const { data } = response;

      return new Promise<Developer[]>((resolve) => {
        // setTimeout(() => {
        resolve(
          data.map((x) => {
            return {
              ...x,
              id: `000${x.id}` as any as number,
            } as Developer;
          }),
        );
        // }, 1000);
      });
    });
};

const detailCols: InfiniteTablePropColumns<Developer> = {
  firstNameChildColumn: {
    field: 'firstName',

    renderHeader: () => {
      return h(HeaderWithCount);
    },
  },
  age: { field: 'age' },
  salary: { field: 'salary' },
  canDesign: { field: 'canDesign' },
  preferredLanguage: { field: 'preferredLanguage' },
  city: { field: 'city' },
  lastName: { field: 'lastName' },
  hobby: { field: 'hobby' },
  stack: { field: 'stack' },
  streetName: { field: 'streetName' },
  currency: { field: 'currency' },
};

const detailsDOMProps = {
  style: {
    flex: 1,
  },
};

const RowDetail = defineComponent({
  name: 'RowDetail',
  setup() {
    const getMasterDetailContext = useGetMasterDetailContextForVue();

    return () => {
      const rowInfo = getMasterDetailContext()?.masterRowInfo as any;

      if (!rowInfo) {
        return null;
      }
      return h(
        'div',
        { class: 'flex flex-col gap-2 p-[20px] bg-[tomato] h-full' },
        [
          h('form', { class: 'flex flex-row gap-2 items-center' }, [
            h('label', [
              'First name:',
              h('input', {
                name: 'first name',
                class:
                  'bg-white text-black border border-gray-300 rounded-md p-2',
                value: rowInfo.data?.firstName,
              }),
            ]),
            h('label', [
              'Age:',
              h('input', {
                name: 'last name',
                type: 'number',
                value: rowInfo.data?.age,
              }),
            ]),
          ]),
          h(
            DataSource as any,
            {
              debugId: `datasource-detail-${rowInfo.id}`,
              data: detailDataSource,
              shouldReloadData: {
                filterValue: true,
                sortInfo: true,
              },
              primaryKey: 'id',
              defaultGroupBy: [
                {
                  field: 'stack',
                },
              ],
              defaultFilterValue: [],
              key: rowInfo.id,
            },
            {
              default: () =>
                h(InfiniteTable as any, {
                  debugId: `infinite-detail-${rowInfo.id}`,
                  domProps: detailsDOMProps,
                  columns: detailCols,
                }),
            },
          ),
        ],
      );
    };
  },
});

const components = {
  RowDetail,
};

const defaultRowDetailState = {
  expandedRows: [1, 2],
  collapsedRows: true as const,
};

const domProps = {
  className: styles.CustomRowHeight,
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};
</script>

<template>
  <DataSource :data="dataSource" primaryKey="id">
    <InfiniteTable
      debugId="root-infinite"
      :columnDefaultWidth="130"
      :rowHeight="50"
      :defaultRowDetailState="defaultRowDetailState"
      :rowDetailCache="false"
      :components="components"
      :domProps="domProps"
      :columns="columns"
    />
  </DataSource>
</template>

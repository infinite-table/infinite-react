<script setup lang="ts">
import { defineComponent, h, ref } from 'vue';

import {
  InfiniteTable,
  DataSource,
  useGetMasterDetailContextForVue,
} from '@infinite-table/infinite-vue';
import type {
  DataSourceData,
  InfiniteTableApi,
  InfiniteTablePropColumns,
  RowDetailState,
  RowDetailStateObject,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;

  city: string;
  currency: string;
  country: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  salary: number;
};

type City = {
  id: number;
  name: string;
  country: string;
};

const masterColumns: InfiniteTablePropColumns<City> = {
  id: {
    field: 'id',
    header: 'ID',
    defaultWidth: 70,
    renderRowDetailIcon: true,
  },
  country: { field: 'country', header: 'Country' },
  city: { field: 'name', header: 'City', defaultFlex: 1 },
};

const detailColumns: InfiniteTablePropColumns<Developer> = {
  firstName: {
    field: 'firstName',
    header: 'First Name',
  },
  salary: {
    field: 'salary',
    type: 'number',
  },

  stack: { field: 'stack' },
  currency: { field: 'currency' },
  city: { field: 'city' },
};

const domProps = {
  style: {
    height: '100%',
  },
};
const shouldReloadData = {
  sortInfo: true,
  filterValue: true,
};
const RowDetail = defineComponent({
  setup() {
    const getMasterDetailContext = useGetMasterDetailContextForVue();

    return () => {
      const masterRowInfo = getMasterDetailContext()?.masterRowInfo;
      if (!masterRowInfo) {
        return null;
      }
      console.log('rendering detail for master row', masterRowInfo.id);
      return h(
        DataSource,
        {
          data: detailDataSource,
          primaryKey: 'id',
          shouldReloadData,
        },
        () =>
          h(InfiniteTable, {
            debugId: 'master-detail-one-expanded-row-example',
            columnDefaultWidth: 150,
            columnMinWidth: 50,
            columns: detailColumns,
          }),
      );
    };
  },
});

const components = {
  RowDetail,
};

const rowDetailState = ref<RowDetailStateObject<any>>({
  collapsedRows: true as const,
  expandedRows: [39],
});

const onReady = ({ api }: { api: InfiniteTableApi<City> }) => {
  console.log(api.rowDetailApi);
};

const onRowDetailStateChange = (newRowDetailState: RowDetailState) => {
  const newState = newRowDetailState.getState();

  const expandedRows =
    newState.expandedRows === true ? [] : newState.expandedRows;

  const oldExpandedRows = new Set(
    rowDetailState.value.expandedRows === true
      ? []
      : rowDetailState.value.expandedRows,
  );

  for (const row of expandedRows) {
    if (!oldExpandedRows.has(row)) {
      rowDetailState.value = {
        collapsedRows: true,
        expandedRows: [row],
      };
      return;
    }
  }

  rowDetailState.value = newState;
};

// fetch an array of cities from the server
const citiesDataSource: DataSourceData<City> = () => {
  const cityNames = new Set<string>();
  const result: City[] = [];
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql`)
    .then((response) => response.json())
    .then((response) => {
      response.data.forEach((data: Developer) => {
        if (cityNames.has(data.city)) {
          return;
        }
        cityNames.add(data.city);
        result.push({
          name: data.city,
          country: data.country,
          id: result.length,
        });
      });

      return result;
    });
};

const detailDataSource: DataSourceData<Developer> = ({
  filterValue,
  sortInfo,
  masterRowInfo,
}) => {
  if (sortInfo && !Array.isArray(sortInfo)) {
    sortInfo = [sortInfo];
  }

  if (!filterValue) {
    filterValue = [];
  }
  if (masterRowInfo) {
    // filter by master country and city
    filterValue = [
      {
        field: 'city',
        filter: {
          operator: 'eq',
          type: 'string',
          value: masterRowInfo.data.name,
        },
      },
      {
        field: 'country',
        filter: {
          operator: 'eq',
          type: 'string',
          value: masterRowInfo.data.country,
        },
      },
      ...filterValue,
    ];
  }
  const args = [
    sortInfo
      ? 'sortInfo=' +
        JSON.stringify(
          sortInfo.map((s) => ({
            field: s.field,
            dir: s.dir,
          })),
        )
      : null,

    filterValue
      ? 'filterBy=' +
        JSON.stringify(
          filterValue.map(({ field, filter }) => {
            return {
              field: field,
              operator: filter.operator,
              value:
                filter.type === 'number' ? Number(filter.value) : filter.value,
            };
          }),
        )
      : null,
  ]
    .filter(Boolean)
    .join('&');

  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql?` + args)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};
</script>

<template>
  <code
    :style="{
      padding: '10px',
      color: 'var(--infinite-cell-color)',
      background: 'var(--infinite-background)',
      maxHeight: '200px',
      overflow: 'auto',
    }"
  >
    <pre>Current expanded row: {{ rowDetailState.expandedRows === true ? '---' : rowDetailState.expandedRows[0] ?? 'none' }}</pre>
  </code>
  <DataSource
    :data="citiesDataSource"
    primaryKey="id"
    :defaultSortInfo="[
      {
        field: 'country',
        dir: 1,
      },
      {
        field: 'name',
        dir: 1,
      },
    ]"
  >
    <InfiniteTable
      debugId="master-detail-one-expanded-row-example-2"
      :domProps="domProps"
      :onReady="onReady"
      :columnDefaultWidth="150"
      :rowDetailState="rowDetailState"
      :onRowDetailStateChange="onRowDetailStateChange"
      :columnMinWidth="50"
      :columns="masterColumns"
      :components="components"
    />
  </DataSource>
</template>

<script setup lang="ts">
import { h, ref, shallowRef } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import type {
  DataSourceData,
  InfiniteTablePropColumns,
  InfiniteTableRowInfo,
  RowDetailState,
  RowDetailStateObject,
  InfiniteTableApi,
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
function renderDetail(rowInfo: InfiniteTableRowInfo<City>) {
  console.log('rendering detail for master row', rowInfo.id);
  return h(
    DataSource,
    {
      data: detailDataSource,
      primaryKey: 'id',
      shouldReloadData,
    },
    () =>
      h(InfiniteTable, {
        debugId: 'master-detail-controlled-expanded-enhanced-example',
        columnDefaultWidth: 150,
        columnMinWidth: 50,
        columns: detailColumns,
      }),
  );
}

const rowDetailState = ref<RowDetailStateObject>({
  collapsedRows: true as const,
  expandedRows: [39, 54],
});

const api = shallowRef<InfiniteTableApi<City> | null>(null);

const onReady = ({ api: tableApi }: { api: InfiniteTableApi<City> }) => {
  api.value = tableApi;
};

const onRowDetailStateChange = (newRowDetailState: RowDetailState) => {
  rowDetailState.value = newRowDetailState.getState();
};

const expandAll = () => api.value?.rowDetailApi.expandAllDetails();

const collapseAll = () => {
  // we could use the api to collapse all details
  // api.value?.rowDetailApi.collapseAllDetails();
  // but we can also use the controlled prop
  rowDetailState.value = {
    collapsedRows: true,
    expandedRows: [],
  };
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
  <div
    :style="{
      display: 'flex',
      flexFlow: 'row',
      color: 'var(--infinite-cell-color)',
      background: 'var(--infinite-background)',
      maxHeight: '200px',
      overflow: 'auto',
      gap: '10px',
    }"
  >
    <code :style="{ paddingInline: '10px' }">
      <pre>Row detail state: {{ JSON.stringify(rowDetailState, null, 2) }}</pre>
    </code>
    <div
      :style="{
        display: 'flex',
        gap: '10px',
        padding: '10px',
        alignItems: 'flex-start',
      }"
    >
      <button @click="expandAll">Expand All</button>
      <button @click="collapseAll">Collapse All</button>
    </div>
  </div>
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
      debugId="master-detail-controlled-expanded-enhanced-example-2"
      :domProps="domProps"
      :onReady="onReady"
      :columnDefaultWidth="150"
      :rowDetailState="rowDetailState"
      :onRowDetailStateChange="onRowDetailStateChange"
      :columnMinWidth="50"
      :columns="masterColumns"
      :rowDetailHeight="200"
      :rowDetailRenderer="renderDetail"
    />
  </DataSource>
</template>

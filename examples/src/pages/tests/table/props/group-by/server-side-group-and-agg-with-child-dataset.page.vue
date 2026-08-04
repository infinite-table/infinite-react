<script setup lang="ts">
import {
  DataSource,
  InfiniteTable,
  GroupRowsState,
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

const domProps = {
  style: {
    height: '80vh',
  },
};
const aggregationReducers: Record<string, any> = {
  salary: {
    name: 'Salary (avg)',
    field: 'salary',
    reducer: 'avg',
  },
};

const columns: Record<string, any> = {
  preferredLanguage: { field: 'preferredLanguage' },
  age: { field: 'age' },

  salary: {
    field: 'salary',
    type: 'number',
  },
  canDesign: { field: 'canDesign' },
  country: { field: 'country' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

const groupRowsState = new GroupRowsState({
  expandedRows: [['France'], ['Canada']],
  collapsedRows: true,
});

const groupBy = [{ field: 'country' as keyof Developer }];

const dataSource = ({
  pivotBy,
  aggregationReducers,
  groupBy,

  groupKeys = [],
  sortInfo,
}: any) => {
  if (sortInfo && !Array.isArray(sortInfo)) {
    sortInfo = [sortInfo];
  }

  const args = [
    pivotBy
      ? 'pivotBy=' +
        JSON.stringify(pivotBy.map((p: any) => ({ field: p.field })))
      : null,
    `groupKeys=${JSON.stringify(groupKeys)}`,
    groupBy
      ? 'groupBy=' +
        JSON.stringify(groupBy.map((p: any) => ({ field: p.field })))
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

    aggregationReducers
      ? 'reducers=' +
        JSON.stringify(
          Object.keys(aggregationReducers).map((key) => ({
            field: aggregationReducers[key].field,
            id: key,
            name: aggregationReducers[key].reducer,
          })),
        )
      : null,
  ]
    .filter(Boolean)
    .join('&');
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers10-sql?` + args)
    .then((r) => r.json())
    .then(
      (data) =>
        new Promise((resolve) => {
          data.data.forEach((item: any) => {
            if (JSON.stringify(item.keys) === JSON.stringify(['France'])) {
              item.dataset = {
                data: [
                  {
                    id: 4,
                    companyName: 'Langworth Inc',
                    companySize: '0 - 10',
                    firstName: 'Alexandre',
                    lastName: 'Harber',
                    country: 'France',
                    countryCode: 'FR',
                    city: 'Persan',
                    streetName: 'Runte Mountain',
                    streetPrefix: 'Loop',
                    streetNo: 959,
                    age: 35,
                    currency: 'EUR',
                    preferredLanguage: 'Go',
                    reposCount: 10,
                    stack: 'backend',
                    canDesign: 'yes',
                    salary: 97000,
                    hobby: 'reading',
                    email: 'Alexandre_Harber@hotmail.com',
                  },
                ],
                totalCount: 1,
                cache: true,
              };
            }
          });
          resolve(data);
        }),
    );
};
</script>

<template>
  <DataSource
    primaryKey="id"
    :lazyLoad="true"
    :data="dataSource"
    :groupBy="groupBy"
    :defaultGroupRowsState="groupRowsState"
    :aggregationReducers="aggregationReducers"
  >
    <InfiniteTable
      :domProps="domProps"
      :columns="columns"
      :columnDefaultWidth="220"
    />
  </DataSource>
</template>

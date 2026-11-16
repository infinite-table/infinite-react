<!--
  Code shown on the Vue version of the "Group Aggregations" page: the sibling of
  group-aggregations.snippet.tsx, with the same `#region` names. Type-checked
  with vue-tsc against the current source.

  The regions that are the same code in React and Vue are shown from the .tsx
  file (the fences marked `neutral` in the page).
-->
<script setup lang="ts">
import type {
  DataSourceData,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  country: string;
  stack: string;
  age: number;
  salary: number;
};

declare const developers: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;
declare const BASE_URL: string;

// `otherProps` stands for the rest of the `<DataSource />` props
declare const otherProps: {
  primaryKey: keyof Developer;
  data: DataSourceData<Developer>;
};
declare const otherPropsWithoutData: { primaryKey: keyof Developer };

//#region average-aggregation
import {
  DataSource,
  InfiniteTable,
  type DataSourcePropAggregationReducers,
} from '@infinite-table/infinite-vue';

const sum = (a: number, b: number) => a + b;

const reducers: DataSourcePropAggregationReducers<Developer> = {
  avg: {
    initialValue: 0,
    field: 'age',
    reducer: sum,
    done: (acc, data) => Math.round(acc / data.length),
  },

  sumAgg: {
    initialValue: 0,
    field: 'salary',
    reducer: sum
  }
}

// <DataSource primaryKey="id" :data="data" :aggregationReducers="reducers">
//   <InfiniteTable :columns="columns" />
// </DataSource>
//#endregion

function lazyLoadDataFunction() {
  //#region data-function-sending-configurations-to-the
  const data: DataSourceData<Developer> = ({ groupBy, aggregationReducers, sortInfo, groupKeys }) => {
     // it's important to send the current group keys - for top level, this will be []
    const args: string[] = [`groupKeys=${JSON.stringify(groupKeys)}`];

    // turn the sorting info into an array
    if (sortInfo && !Array.isArray(sortInfo)) {
      sortInfo = [sortInfo];
    }

    if (sortInfo) {
      // the backend expects the sort info to be an array of field,dir pairs
      args.push(
        'sortInfo=' +
          JSON.stringify(
            sortInfo.map((s) => ({
              field: s.field,
              dir: s.dir,
            })),
          ),
      );
    }

    if (groupBy) {
      // for grouping, send an array of objects with the `field` property
      args.push(
        'groupBy=' + JSON.stringify(groupBy.map((p) => ({ field: p.field }))),
      );
    }

    if (aggregationReducers) {
      args.push(
        'reducers=' +
          JSON.stringify(
            // by convention, we send an array of reducers, each with `field` `name`(= "avg") and `id`
            // it's up to you to decide what the backend needs
            Object.keys(aggregationReducers).map((key) => ({
              field: aggregationReducers[key].field,
              id: key,
              name: aggregationReducers[key].reducer,
            })),
          ),
      );
    }

    const url = BASE_URL + `/developers10k-sql?` + args.join('&');
    return fetch(url).then(r=>r.json())
  }

  // <DataSource :data="data" :lazyLoad="true" v-bind="otherProps" />
  //#endregion
  return data;
}

const lazyLoadData = lazyLoadDataFunction();
</script>

<template>
  <DataSource
    primaryKey="id"
    :data="developers"
    :aggregationReducers="reducers"
  >
    <InfiniteTable :columns="columns" />
  </DataSource>

  <!-- #region datasourcewith-lazyload-enabled -->
  <!-- #highlight -->
  <DataSource :lazyLoad="true" v-bind="otherProps" />
  <!-- #endregion -->

  <DataSource
    :data="lazyLoadData"
    :lazyLoad="true"
    v-bind="otherPropsWithoutData"
  />
</template>

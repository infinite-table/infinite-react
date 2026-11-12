<script setup lang="ts">
import { computed, ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import type {
  DataSourceApi,
  DataSourceGroupBy,
  DataSourcePropAggregationReducers,
} from '@infinite-table/infinite-vue';

/**
 * Minimal repro: a cell whose content depends on rows OTHER than its own
 * goes stale when one of those other rows is updated.
 *
 * Two such columns, both using only what Infinite provides:
 *   - "group avg (rowInfo.parents)": the leaf renders its parent group's
 *     `reducerResults.revenue` — the same number the group row shows
 *   - "avg via api": the leaf averages `dataSourceApi.getOriginalDataArray()`
 *     for its segment — works without grouping as well
 *
 * Click "Acme 100 -> 400". Enterprise average becomes 300.
 *   - the group row shows 300           -> its reducerResults changed, the rowInfo diff notifies it
 *   - Acme's two cells show 300         -> its own data changed, notified
 *   - Globex's and Initech's cells      -> STILL 200. Their rowInfo is considered equal
 *                                          (`parents` is excluded from the diff, `data` is the
 *                                          same object), so they are never notified and never
 *                                          re-render.
 * Untick "group by segment": the "avg via api" column shows the same
 * staleness with no grouping involved. Toggling grouping re-renders the
 * table and "fixes" the cells, which is the point: nothing is cached, the
 * cells were simply not told to render again.
 */
type Sale = { id: number; account: string; segment: string; revenue: number };

const data: Sale[] = [
  { id: 1, account: 'Acme', segment: 'Enterprise', revenue: 100 },
  { id: 2, account: 'Globex', segment: 'Enterprise', revenue: 200 },
  { id: 3, account: 'Initech', segment: 'Enterprise', revenue: 300 },
  { id: 4, account: 'Hooli', segment: 'SMB', revenue: 10 },
  { id: 5, account: 'Vandelay', segment: 'SMB', revenue: 30 },
];

const columns: Record<string, any> = {
  id: { field: 'id', defaultWidth: 60 },
  account: { field: 'account' },
  segment: { field: 'segment' },
  revenue: { field: 'revenue', type: 'number', defaultEditable: true },
  groupAvg: {
    header: 'group avg (rowInfo.parents)',
    type: 'number',
    defaultWidth: 220,
    render: ({ rowInfo }: any) => {
      if (rowInfo.isGroupRow || !rowInfo.dataSourceHasGrouping) {
        return null;
      }
      const parentGroup = rowInfo.parents[rowInfo.parents.length - 1];
      const revenue = parentGroup?.reducerResults?.revenue;
      return revenue == null ? null : `${revenue}`;
    },
  },
  avgViaApi: {
    header: 'avg via api (getOriginalDataArray)',
    type: 'number',
    defaultWidth: 260,
    render: ({ rowInfo, dataSourceApi }: any) => {
      if (rowInfo.isGroupRow) {
        return null;
      }
      const rows: Sale[] = dataSourceApi
        .getOriginalDataArray()
        .filter((row: Sale) => row.segment === rowInfo.data.segment);
      const avg = rows.reduce((sum, row) => sum + row.revenue, 0) / rows.length;
      return `${avg}`;
    },
  },
};

const aggregationReducers: DataSourcePropAggregationReducers<Sale> = {
  revenue: {
    field: 'revenue',
    initialValue: 0,
    reducer: (acc, value) => acc + value,
    done: (sum, arr) => (arr.length ? sum / arr.length : 0),
  },
};

// kept out of Vue reactivity, so the api object is not proxied
let dataSourceApi: DataSourceApi<Sale> | undefined;
const onReady = (api: DataSourceApi<Sale>) => {
  dataSourceApi = api;
};

const grouped = ref(true);

const groupBy = computed<DataSourceGroupBy<Sale>[]>(() =>
  grouped.value ? [{ field: 'segment' }] : [],
);

const onUpdateClick = () => {
  dataSourceApi!.updateData({ id: 1, revenue: 400 });
};

const onResetClick = () => {
  dataSourceApi!.updateData({ id: 1, revenue: 100 });
};

const toolbarStyle = {
  display: 'flex',
  gap: '8px',
  padding: '8px',
  alignItems: 'center',
};

const domProps = { style: { height: '400px', margin: '8px' } };
</script>

<template>
  <div :style="toolbarStyle">
    <button data-name="update" @click="onUpdateClick">
      Acme 100 -&gt; 400 (Enterprise avg becomes 300)
    </button>
    <button data-name="reset" @click="onResetClick">
      Reset Acme to 100 (avg back to 200)
    </button>
    <label>
      <input type="checkbox" data-name="grouped" v-model="grouped" />
      group by segment
    </label>
  </div>

  <DataSource
    :data="data"
    primaryKey="id"
    :onReady="onReady"
    :groupBy="groupBy"
    :aggregationReducers="aggregationReducers"
  >
    <InfiniteTable
      :domProps="domProps"
      :columnDefaultWidth="130"
      :columns="columns"
    />
  </DataSource>
</template>

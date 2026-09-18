<script setup lang="ts">
import { ref } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type {
  DataSourceApi,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-vue';

// see default.page.tsx for the description of this test page

type Sale = { id: number; account: string; segment: string; revenue: number };

const data: Sale[] = [
  { id: 1, account: 'Acme', segment: 'Enterprise', revenue: 100 },
  { id: 2, account: 'Globex', segment: 'Enterprise', revenue: 200 },
  { id: 3, account: 'Initech', segment: 'Enterprise', revenue: 300 },
  { id: 4, account: 'Hooli', segment: 'SMB', revenue: 10 },
  { id: 5, account: 'Vandelay', segment: 'SMB', revenue: 30 },
];

// per-cell render counts, read by the spec: `${columnId}:${rowId}` -> count
const renderCounts: Record<string, number> = {};
(globalThis as any).renderCounts = renderCounts;

function countRender(columnId: string, rowId: number) {
  const key = `${columnId}:${rowId}`;
  renderCounts[key] = (renderCounts[key] ?? 0) + 1;
}

function segmentAvg(rows: Sale[], segment: string) {
  const segmentRows = rows.filter((row) => row.segment === segment);
  return (
    segmentRows.reduce((sum, row) => sum + row.revenue, 0) / segmentRows.length
  );
}

const columns: InfiniteTablePropColumns<Sale> = {
  id: { field: 'id', defaultWidth: 60 },
  account: { field: 'account' },
  segment: { field: 'segment' },
  revenue: { field: 'revenue', type: 'number', defaultEditable: true },
  noKey: {
    header: 'segment avg (no key)',
    type: 'number',
    render: ({ rowInfo, dataSourceApi }) => {
      if (rowInfo.isGroupRow) {
        return null;
      }
      countRender('noKey', rowInfo.id);
      return String(
        segmentAvg(dataSourceApi.getOriginalDataArray(), rowInfo.data.segment),
      );
    },
  },
  anyChange: {
    header: 'segment avg (key: any change)',
    type: 'number',
    // a new object on every data change
    repaintCellsKey: ({ dataSourceState }) =>
      dataSourceState.originalDataArrayChangedInfo,
    render: ({ rowInfo, dataSourceApi }) => {
      if (rowInfo.isGroupRow) {
        return null;
      }
      countRender('anyChange', rowInfo.id);
      return String(
        segmentAvg(dataSourceApi.getOriginalDataArray(), rowInfo.data.segment),
      );
    },
  },
  segmentKey: {
    header: 'segment avg (key: segment avg)',
    type: 'number',
    // the derived value is the key - the cell repaints only when it changes
    repaintCellsKey: ({ rowInfo, dataSourceState, previousDataSourceState }) => {
      if (rowInfo.isGroupRow) {
        return null;
      }
      (globalThis as any).lastRepaintCellsKeyParams = {
        rowId: rowInfo.id,
        hasPreviousState: !!previousDataSourceState,
        previousLength: previousDataSourceState?.originalDataArray.length,
        currentLength: dataSourceState.originalDataArray.length,
      };
      return segmentAvg(dataSourceState.originalDataArray, rowInfo.data.segment);
    },
    render: ({ rowInfo, dataSourceApi }) => {
      if (rowInfo.isGroupRow) {
        return null;
      }
      countRender('segmentKey', rowInfo.id);
      return String(
        segmentAvg(dataSourceApi.getOriginalDataArray(), rowInfo.data.segment),
      );
    },
  },
};

const dataSourceApi = ref<DataSourceApi<Sale> | null>(null);
const repaintCellsKey = ref(0);

const onReady = (api: DataSourceApi<Sale>) => {
  dataSourceApi.value = api;
};

const update = () => {
  dataSourceApi.value!.updateData({ id: 1, revenue: 400 });
};
const reset = () => {
  dataSourceApi.value!.updateData({ id: 1, revenue: 100 });
};
const repaintAll = () => {
  repaintCellsKey.value++;
};

const domProps = {
  style: { height: '400px', margin: '8px' },
};
</script>

<template>
  <div style="display: flex; gap: 8px; padding: 8px; align-items: center">
    <button data-name="update" @click="update">
      Acme 100 -&gt; 400 (Enterprise avg becomes 300)
    </button>
    <button data-name="reset" @click="reset">
      Reset Acme to 100 (avg back to 200)
    </button>
    <button data-name="repaint-all" @click="repaintAll">
      repaint all (bump table repaintCellsKey)
    </button>
    <span data-name="repaint-key">{{ repaintCellsKey }}</span>
  </div>

  <DataSource :data="data" primaryKey="id" :onReady="onReady">
    <InfiniteTable
      :domProps="domProps"
      :columnDefaultWidth="200"
      :columns="columns"
      :repaintCellsKey="repaintCellsKey"
    />
  </DataSource>
</template>

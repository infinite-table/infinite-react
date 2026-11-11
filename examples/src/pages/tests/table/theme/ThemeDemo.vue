<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import {
  createFlashingColumnCellComponent,
  DataSource,
  InfiniteTable,
} from '@infinite-table/infinite-vue';

import { formatNumber, instruments, tickInstrument } from './themeDemoData';

const props = defineProps<{
  themeName: string;
  defaultMode?: 'light' | 'dark';
}>();

const FlashingCell = createFlashingColumnCellComponent({ flashDuration: 800 });

const numberColumn = (
  field: string,
  header: string,
  decimals = 2,
  flashing = false,
) => ({
  field,
  header,
  type: 'number',
  defaultWidth: 110,
  renderValue: ({ value }: { value: any }) => formatNumber(value, decimals),
  ...(flashing ? { components: { ColumnCell: FlashingCell } } : {}),
});

const columns: Record<string, any> = {
  rowNumber: {
    header: '',
    defaultWidth: 48,
    align: 'center',
    defaultSortable: false,
    renderValue: ({ rowInfo }: { rowInfo: any }) =>
      rowInfo.isGroupRow ? '' : `${rowInfo.indexInAll + 1}`,
  },
  symbol: { field: 'symbol', header: 'Symbol', defaultWidth: 100 },
  name: { field: 'name', header: 'Name', defaultWidth: 170 },
  price: numberColumn('price', 'Price', 2, true),
  change: numberColumn('change', 'Chg', 2, true),
  bid: numberColumn('bid', 'Bid', 2, true),
  ask: numberColumn('ask', 'Ask', 2, true),
  volume: numberColumn('volume', 'Volume', 0),
  position: numberColumn('position', 'Position', 0),
  pnl: numberColumn('pnl', 'P&L', 0),
};

const groupBy = [{ field: 'sector' }];
const defaultSortInfo = [{ field: 'symbol', dir: 1 }];
const defaultRowSelection = { selectedRows: [5, 10, 4], defaultSelection: false };
const domProps = { style: { flex: 1, minHeight: 0 } };

const mode = ref<'light' | 'dark'>(props.defaultMode ?? 'light');
const density = ref('');
const ticking = ref(false);
let api: any = null;
let interval: any = null;

const onReady = (dataSourceApi: any) => {
  api = dataSourceApi;
};

watch(ticking, (tick) => {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
  if (tick) {
    interval = setInterval(() => {
      if (!api) return;
      const rows = api.getRowInfoArray();
      for (let i = 0; i < 4; i++) {
        const rowInfo = rows[Math.floor(Math.random() * rows.length)];
        if (rowInfo && !rowInfo.isGroupRow && rowInfo.data) {
          api.updateData(tickInstrument(rowInfo.data));
        }
      }
    }, 120);
  }
});

onBeforeUnmount(() => interval && clearInterval(interval));
</script>
<template>
  <div :class="`infinite-theme-mode--${mode}`">
    <div
      id="theme-demo"
      :class="[
        `infinite-theme-name--${props.themeName}`,
        density ? `infinite-density--${density}` : '',
      ]"
      style="
        display: flex;
        flex-flow: column;
        height: 100vh;
        background: var(--infinite-background);
        color: var(--infinite-color);
      "
    >
      <div style="display: flex; gap: 8px; padding: 8px; align-items: center">
        <button
          data-name="mode"
          @click="mode = mode === 'light' ? 'dark' : 'light'"
        >
          {{ mode }}
        </button>
        <select data-name="density" title="density" v-model="density">
          <option value="">default density</option>
          <option value="compact">compact</option>
          <option value="comfortable">comfortable</option>
          <option value="spacious">spacious</option>
        </select>
        <label>
          <input data-name="ticking" type="checkbox" v-model="ticking" />
          ticking
        </label>
      </div>
      <DataSource
        :data="instruments"
        primaryKey="id"
        :groupBy="groupBy"
        :onReady="onReady"
        :defaultSortInfo="defaultSortInfo"
        :defaultRowSelection="defaultRowSelection"
        selectionMode="multi-row"
      >
        <InfiniteTable
          :columns="columns"
          :defaultColumnPinning="{ rowNumber: 'start' }"
        keyboardNavigation="cell"
          :defaultActiveCellIndex="[2, 4]"
          :domProps="domProps"
        />
      </DataSource>
    </div>
  </div>
</template>

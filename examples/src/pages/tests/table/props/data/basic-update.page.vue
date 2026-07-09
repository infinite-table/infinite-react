<script setup lang="ts">
import { defineComponent, h, ref, shallowRef } from 'vue';

import {
  DataSource,
  InfiniteTable,
  useInfiniteColumnCell,
} from '@infinite-table/infinite-vue';
import type {
  DataSourceApi,
  DataSourceDataFn,
  InfiniteTableApi,
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

const RenderCountColumnCell = defineComponent({
  name: 'RenderCountColumnCell',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    const cellContextRef = useInfiniteColumnCell<Developer>();
    let renderCount = 0;

    return () => {
      renderCount += 1;
      const ctx = cellContextRef.value;

      return h(
        'div',
        {
          ...attrs,
          ref: ctx?.domRef as any,
          'data-render-count': renderCount,
        },
        slots.default ? slots.default() : null,
      );
    };
  },
});

const columns: Record<string, any> = {
  // id: { field: 'id' },
  salary: {
    field: 'salary',
    header: () => {
      return h('div', `Salary ${Date.now()}`);
    },
    defaultWidth: 250,
    components: {
      ColumnCell: RenderCountColumnCell,
    },
  },
  age: {
    field: 'age',
    components: {
      ColumnCell: RenderCountColumnCell,
    },
  },
  firstName: {
    field: 'firstName',
    components: {
      ColumnCell: RenderCountColumnCell,
    },
  },
};

const dataSourceFn: DataSourceDataFn<Developer> = ({}) => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql`)
    .then((r) => r.json())
    .then((data) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newData = [...data.data.slice(0, 2)];

          resolve(newData);
        }, 20);
      });
    });
};

const active = [true, true];
let updateCountRef = 0;
const ds = shallowRef<DataSourceDataFn<Developer>>(dataSourceFn);

let dataSourceApi: DataSourceApi<Developer> | null = null;
let api: InfiniteTableApi<Developer> | null = null;

const activeCellIndex = ref<[number, number] | null>(null);
const header = ref(true);

const onReady = (params: {
  dataSourceApi: DataSourceApi<Developer>;
  api: InfiniteTableApi<Developer>;
}) => {
  dataSourceApi = params.dataSourceApi;
  api = params.api;
};

const onActiveCellIndexChange = (index: [number, number] | null) => {
  activeCellIndex.value = index;
};

const onUpdateClick = () => {
  if (!dataSourceApi || !api) {
    return;
  }

  const { start, end } = api.getVisibleRenderRange();
  const [startRow, startCol] = start;
  const [endRow, endCol] = end;

  const randomRow =
    Math.floor(Math.random() * (endRow - 1 - startRow + 1)) + startRow;
  const randomCol =
    Math.floor(Math.random() * (endCol - 1 - startCol + 1)) + startCol;

  const [activeRow, activeCol] = activeCellIndex.value || [];

  const updateRow = activeRow ?? randomRow;
  const updateCol = activeCol ?? randomCol;

  console.log('updating', updateRow, updateCol);
  const colId = Object.keys(columns)[updateCol];
  const rowId = dataSourceApi.getPrimaryKeyByIndex(updateRow);
  const updateCount = updateCountRef++;
  const nextValue =
    colId === 'firstName' ? `Updated ${updateCount}` : 100_000 + updateCount;

  dataSourceApi.updateData({
    [colId]: nextValue,
    id: rowId,
  });
};

const onRemoveRowClick = () => {
  if (!dataSourceApi || !api) {
    return;
  }

  const [activeRow] = activeCellIndex.value || [];
  const rowId = dataSourceApi.getPrimaryKeyByIndex(activeRow as number);
  dataSourceApi.removeData({ id: rowId });
};

const onUpdateDataSourceClick = () => {
  ds.value = dataSourceFn.bind(null);
};

const onToggleHeaderClick = () => {
  header.value = !header.value;
};

const domProps = {
  style: {
    margin: '5px',
    height: '900px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};
</script>

<template>
  <div class="flex gap-2 items-center justify-center m-1">
    <button @click="onUpdateClick">update</button>
    <button @click="onRemoveRowClick">remove row</button>
    <button @click="onUpdateDataSourceClick">update datasource</button>
    <button @click="onToggleHeaderClick">toggle header</button>
  </div>
  <DataSource v-if="active[0]" :data="ds" primaryKey="id">
    <InfiniteTable
      :header="header"
      :onActiveCellIndexChange="onActiveCellIndexChange"
      debugId="test"
      :onReady="onReady"
      :domProps="domProps"
      :columns="columns"
    />
  </DataSource>
</template>

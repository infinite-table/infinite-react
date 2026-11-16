<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-vue';

import '@infinite-table/infinite-vue/theme/paper.css';

type Task = {
  id: number;
  title: string;
  status: string;
  owner: string;
  estimate: number;
};

const STATUSES = ['Backlog', 'In progress', 'Done'];
const OWNERS = ['Ana', 'Ben', 'Chloe', 'Dan'];

const data: Task[] = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  title: `Task ${i + 1}`,
  status: STATUSES[i % STATUSES.length],
  owner: OWNERS[i % OWNERS.length],
  estimate: ((i * 3) % 8) + 1,
}));

const columns: InfiniteTablePropColumns<Task> = {
  title: { field: 'title', header: 'Title', defaultFlex: 1 },
  owner: { field: 'owner', header: 'Owner' },
  estimate: { field: 'estimate', header: 'Estimate', type: 'number' },
};
</script>

<template>
  <div class="infinite-theme-name--paper" :style="{ display: 'flex', flex: 1 }">
    <DataSource
      :data="data"
      primaryKey="id"
      :groupBy="[{ field: 'status' }]"
      selectionMode="multi-row"
      :defaultRowSelection="{ selectedRows: [1, 4], defaultSelection: false }"
      :defaultSortInfo="[{ field: 'estimate', dir: -1 }]"
    >
      <InfiniteTable :columns="columns" />
    </DataSource>
  </div>
</template>

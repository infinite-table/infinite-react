<script setup lang="ts">
import { ref } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type {
  InfiniteTablePropColumns,
  InfiniteTablePropGetCellContextMenuItems,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  age: number;
};

const data: Developer[] = [
  { id: 1, firstName: 'John', age: 20 },
  { id: 2, firstName: 'Marry', age: 25 },
];

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: { field: 'firstName' },
  age: { field: 'age', type: 'number' },
};

const extraItems = Array.from({ length: 8 }, (_, index) => ({
  key: `extra-${index}`,
  label: `Extra ${index}`,
}));

const getCellContextMenuItems: InfiniteTablePropGetCellContextMenuItems<
  Developer
> = () => extraItems;

const portalEl = ref<HTMLElement | null>(null);
const constrainEl = ref<HTMLElement | null>(null);

const menuPortalContainer = () => portalEl.value;
const menuConstrainTo = () => constrainEl.value;

const domProps = { style: { width: '400px', height: '120px' } };
</script>

<template>
  <div
    data-name="constrain"
    ref="constrainEl"
    style="position: relative; width: 800px; height: 600px"
  >
    <div data-name="clip" style="width: 400px; height: 120px; overflow: hidden">
      <DataSource :data="data" primaryKey="id">
        <InfiniteTable
          :domProps="domProps"
          :columns="columns"
          :columnDefaultWidth="150"
          :getCellContextMenuItems="getCellContextMenuItems"
          :menuPortalContainer="menuPortalContainer"
          :menuConstrainTo="menuConstrainTo"
        />
      </DataSource>
    </div>
    <div data-name="portal" ref="portalEl" />
  </div>
</template>

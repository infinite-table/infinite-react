<script setup lang="ts">
import { computed, ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { columns, developers1kDataSource } from './common';

const color = ref({
  r: 77,
  g: 0,
  b: 215,
});

const defaultColor = computed(
  () =>
    `#${color.value.r.toString(16)}${color.value.g
      .toString(16)
      .padEnd(2, '0')}${color.value.b.toString(16)}`,
);

const domProps = computed(() => {
  return {
    style: {
      height: '90vh',
      '--infinite-active-cell-border-color--r': color.value.r,
      '--infinite-active-cell-border-color--g': color.value.g,
      '--infinite-active-cell-border-color--b': color.value.b,
    },
  };
});

const onColorChange = (event: any) => {
  const colorValue = event.target.value;

  const r = parseInt(colorValue.substr(1, 2), 16);
  const g = parseInt(colorValue.substr(3, 2), 16);
  const b = parseInt(colorValue.substr(5, 2), 16);

  color.value = {
    r,
    g,
    b,
  };
};
</script>

<template>
  <div>
    <input />
    <div>
      <input type="color" @change="onColorChange" :value="defaultColor" />
    </div>

    <DataSource primaryKey="id" :data="developers1kDataSource">
      <InfiniteTable :domProps="domProps" :columns="columns" />
    </DataSource>
    <input />
  </div>
</template>

<script setup lang="ts">
import { defineComponent, h, ref } from 'vue';

import { DataSource, useDataSourceContext } from '@infinite-table/infinite-vue';
import type { DataSourceSortInfo } from '@infinite-table/infinite-vue';

import { Person, persons } from './sortPersons';

const Cmp = defineComponent({
  setup() {
    const context = useDataSourceContext<Person>();

    return () => {
      const { dataArray, loading } = context.state.value;

      return h('div', loading ? 'loading' : JSON.stringify(dataArray));
    };
  },
});

(globalThis as any).calls = 0;

const sortInfo = ref<DataSourceSortInfo<Person>>({
  dir: 1,
  field: 'age',
});

(globalThis as any).setSortInfo = (info: DataSourceSortInfo<Person>) => {
  sortInfo.value = info;
};

const enabled = ref(false);

const onSortInfoChange = (info: DataSourceSortInfo<Person> | null) => {
  (globalThis as any).calls++;
  console.log(info);
  if (enabled.value) {
    sortInfo.value = info as DataSourceSortInfo<Person>;
  }
};

const toggle = () => {
  enabled.value = !enabled.value;
};

const fields = ['name', 'id', 'age'] as const;
</script>

<template>
  <p>Currently the sorting is {{ enabled ? 'enabled' : 'disabled' }}</p>
  <button @click="toggle">
    Toggle - click the toggle to {{ enabled ? 'disable' : 'enable' }} sortInfo
  </button>
  <div id="source">
    <DataSource
      :data="persons"
      primaryKey="id"
      :fields="fields"
      :sortInfo="sortInfo"
      :onSortInfoChange="onSortInfoChange"
    >
      <Cmp />
    </DataSource>
  </div>
</template>

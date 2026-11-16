<!--
  Code shown on the Vue version of index.page.md: the sibling of
  index.snippet.tsx, with the same `#region` names. Type-checked with vue-tsc
  against the current source.
-->
<script setup lang="ts">
import { ref } from 'vue';
import {
  DataSource,
  type DataSourcePropGroupBy,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  country: string;
};

declare const data: Developer[];

const groupField = ref<keyof Developer>('country');

//#region issue-performance-degradation-stable-props
const groupBy = ref<DataSourcePropGroupBy<Developer>>([{ field: 'country' }]);

const onGroupByChange = (newGroupBy: DataSourcePropGroupBy<Developer>) => {
  groupBy.value = newGroupBy;
};

// <DataSource primaryKey="id" :data="data" :groupBy="groupBy" :onGroupByChange="onGroupByChange" />
//#endregion
</script>

<template>
  <!-- #region issue-performance-degradation-because-props-are -->
  <!-- dont do this -->
  <DataSource
    primaryKey="id"
    :data="data"
    :groupBy="[{ field: groupField }]"
  />
  <!-- #endregion -->

  <DataSource
    primaryKey="id"
    :data="data"
    :groupBy="groupBy"
    :onGroupByChange="onGroupByChange"
  />
</template>

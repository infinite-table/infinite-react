<!--
  Code shown on the Vue version of the "Theming" page: the sibling of
  index.snippet.tsx, with the same `#region` names. Type-checked with vue-tsc
  against the current source.
-->
<script setup lang="ts">
import {
  DataSource,
  InfiniteTable,
  type DataSourceProps,
  type InfiniteTableProps,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  country: string;
};

// the snippets bind these - the page is about the class names around the component
declare const dataSouceProps: DataSourceProps<Developer>;
declare const props: InfiniteTableProps<Developer>;

//#region intro
import '@infinite-table/infinite-vue/index.css';
//#endregion

//#region theme-css-imports
import '@infinite-table/infinite-vue/theme/shadcn.css'
import '@infinite-table/infinite-vue/theme/balsam.css'
import '@infinite-table/infinite-vue/theme/minimalist.css'
import '@infinite-table/infinite-vue/theme/ocean.css'
import '@infinite-table/infinite-vue/theme/terminal.css'
import '@infinite-table/infinite-vue/theme/sheet.css'
import '@infinite-table/infinite-vue/theme/paper.css'
//#endregion

//#region terminal-theme
import '@infinite-table/infinite-vue/theme/terminal.css'
//#endregion

//#region sheet-theme
import '@infinite-table/infinite-vue/theme/sheet.css'
//#endregion

//#region paper-theme
import '@infinite-table/infinite-vue/theme/paper.css'
//#endregion
</script>

<template>
  <!-- #region applying-the-minimalist-theme-with-dark-mode -->
  <body class="infinite-theme-mode--dark infinite-theme-name--minimalist">
    <DataSource v-bind="dataSouceProps">
      <InfiniteTable v-bind="props" />
    </DataSource>
  </body>
  <!-- #endregion -->

  <!-- #region explicitly-applying-light-mode-via-container -->
  <div class="infinite-theme-mode--light">
    <DataSource v-bind="dataSouceProps">
      <InfiniteTable v-bind="props" />
    </DataSource>
  </div>
  <!-- #endregion -->

  <!-- #region explicitly-applying-dark-theme-via-container -->
  <body class="infinite-theme-mode--dark">
    <div>
      <DataSource v-bind="dataSouceProps">
        <InfiniteTable v-bind="props" />
      </DataSource>
    </div>
  </body>
  <!-- #endregion -->

  <!-- #region using-the-compact-density -->
  <div class="infinite-theme-name--minimalist infinite-density--compact">
    <DataSource v-bind="dataSouceProps">
      <InfiniteTable v-bind="props" />
    </DataSource>
  </div>
  <!-- #endregion -->

  <!-- #region terminal-theme-class-names -->
  <div class="infinite-theme-name--terminal infinite-theme-mode--dark">
    <DataSource v-bind="dataSouceProps">
      <InfiniteTable v-bind="props" />
    </DataSource>
  </div>
  <!-- #endregion -->
</template>

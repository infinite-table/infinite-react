// Code shown on the Vue version of the "Getting Started" page: the sibling of
// index.snippet.tsx, with the same `#region` names. Type-checked with vue-tsc
// against the current source.

//#region css-import
import '@infinite-table/infinite-vue/index.css';
//#endregion

//#region typescript-types
import type {
  InfiniteTablePropColumns, // or accessible as InfiniteTableProps['columns']
  // corresponding to the `columns` prop
  DataSourcePropGroupBy, // or accessible as DataSourceProps['groupBy']
  // corresponding to the `groupBy` prop
} from '@infinite-table/infinite-vue';
//#endregion

// Snippets shown on the Vue version of extending-existing-filters.page.md: the sibling of
// extending-existing-filters.adding-a-new-filter-type-by-updating.snippet.tsx, with the same
// `#region` names. Type-checked with vue-tsc against the library source (`npm run tsc:vue`).

//#region adding-a-new-filter-type-by-updating
import { defaultFilterTypes } from '@infinite-table/infinite-vue';

defaultFilterTypes.bool = {
  defaultOperator: 'eq',
  emptyValues: [null],
  operators: [
    {
      name: 'eq',
      label: 'Equals',
      fn: ({ currentValue, filterValue }) => currentValue === filterValue,
    },
  ],
};
//#endregion

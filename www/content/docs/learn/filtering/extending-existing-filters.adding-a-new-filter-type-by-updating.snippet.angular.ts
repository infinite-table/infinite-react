// Snippets shown on the Angular version of extending-existing-filters.page.md: the sibling of
// extending-existing-filters.adding-a-new-filter-type-by-updating.snippet.tsx, with the same
// `#region` names. Type-checked by `npm run tsc:angular`.

//#region adding-a-new-filter-type-by-updating
import { defaultFilterTypes } from '@infinite-table/infinite-angular';

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

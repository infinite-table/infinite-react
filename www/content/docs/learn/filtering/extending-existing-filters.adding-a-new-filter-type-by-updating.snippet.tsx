// Snippets shown on extending-existing-filters.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).

//#region adding-a-new-filter-type-by-updating
import { defaultFilterTypes } from '@infinite-table/infinite-react';

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

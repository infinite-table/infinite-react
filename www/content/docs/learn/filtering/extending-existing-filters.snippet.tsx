// Snippets shown on extending-existing-filters.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';

type Developer = {
  id: number;
  firstName: string;
  canDesign: boolean;
};

declare const data: Developer[];

function ReactComponentForIcon() {
  return <span>⊅</span>;
}

//#region adding-a-new-operator-to-the-string-filter-type
import { defaultFilterTypes } from '@infinite-table/infinite-react';

// add new operators for the `string` filter type
defaultFilterTypes.string.operators.push({
  name: 'notContains',
  components: { Icon: ReactComponentForIcon },
  label: 'Not Contains',
  fn: ({currentValue, filterValue }) => {
    return typeof currentValue === 'string' &&
            typeof filterValue == 'string' &&
            !currentValue.toLowerCase().includes(filterValue.toLowerCase())
  }
})
//#endregion

//#region adding-a-new-filter-type-by-using-the
import { DataSource } from '@infinite-table/infinite-react';

<DataSource
  primaryKey="id"
  data={data}
  filterTypes={{
    bool: {
      defaultOperator: 'eq',
      emptyValues: [null],
      operators: [
        {
          name: 'eq',
          label: 'Equals',
          fn: ({ currentValue, filterValue }) => currentValue === filterValue,
        },
      ],
    },
  }}
/>;
//#endregion

export {};

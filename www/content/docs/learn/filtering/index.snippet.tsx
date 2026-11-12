// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
  InfiniteTable,
} from '@infinite-table/infinite-react';

{
  //#region specifying-an-initial-filter-value-for-the
  <DataSource<Developer>
    data={...}
    defaultFilterValue={[
      {
        field: 'age',
        filter: {
          operator: 'gt',
          value: 30,
          type: 'number'
        }
      }
    ]}
  >
    <InfiniteTable<Developer>
      columns={...}
    />
  </DataSource>
  //#endregion
}

{
  //#region understanding-filter-types
  const filterTypes = {
    income: {
      label: 'Income',
      emptyValues: ['', null, undefined],
      defaultOperator: 'gt',
      operators: [
        {
          name: 'gt',
          label: 'Greater than',
          fn: ({ currentValue, filterValue, emptyValues }) => {
            if (emptyValues.has(currentValue)) {
              return true;
            }
            return currentValue > filterValue;
          },
        },
        {
          name: 'gte',
          //...
        },
        {
          name: 'lt',
          //...
        },
        {
          name: 'lte',
          //...
        },
      ],
    },
  };
  //#endregion
}

{
  //#region filtering-columns-not-bound-to-a-field
  defaultFilterValue={[
    {
      id: 'salary',
      valueGetter: ({ data }) => data.salary,
      filter: {
        operator: 'gt',
        value: '',
        type: 'number',
      }
    },
  ]}
  //#endregion
}

export {};

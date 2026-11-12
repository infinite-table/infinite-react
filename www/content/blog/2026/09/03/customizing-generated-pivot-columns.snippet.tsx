// Snippets shown on customizing-generated-pivot-columns.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  InfiniteTable,
} from '@infinite-table/infinite-react';

{
  //#region global-defaults-width-and-sorting
  <InfiniteTable
    pivotColumn={{
      defaultSortable: true,
      defaultWidth: 180,
    }}
  />
  //#endregion
}

{
  //#region global-defaults-width-and-sorting-2
  <InfiniteTable
    pivotColumn={({ column }) => ({
      defaultSortable: !column.pivotTotalColumn,
    })}
  />
  //#endregion
}

{
  //#region per-pivot-field-headers-people-recognize
  const pivotBy = [
    { field: 'country' },
    {
      field: 'canDesign',
      column: {
        defaultWidth: 160,
      },
    },
  ];
  //#endregion
}

{
  //#region per-pivot-field-headers-people-recognize-2
  const pivotBy = [
    { field: 'country' },
    {
      field: 'canDesign',
      column: ({ column }) => ({
        header: column.pivotGroupKey === 'yes' ? 'Designer' : 'Non-designer',
      }),
    },
  ];
  //#endregion
}

{
  //#region per-aggregation-configure-one-measure
  const aggregationReducers = {
    salary: {
      field: 'salary',
      initialValue: 0,
      reducer: (acc, value) => acc + value,
      pivotColumn: {
        defaultSortable: true,
        type: 'number',
      },
    },
    license: {
      field: 'license',
      initialValue: 0,
      reducer: (acc) => acc + 1,
    },
  };
  //#endregion
}

{
  //#region inherit-from-the-columns-you-already-wrote
  const columns = {
    salary: {
      field: 'salary',
      type: 'number',
      style: { color: 'red' },
    },
  };

  const aggregationReducers = {
    avgSalary: {
      field: 'salary',
      reducer: 'avg',
    },
  };
  //#endregion
}

{
  //#region inherit-from-the-columns-you-already-wrote-2
  const columns = {
    stargazers: {
      field: 'stargazers_count',
      type: 'number',
    },
  };
  //#endregion
}

{
  //#region inherit-from-the-columns-you-already-wrote-3
  const aggregationReducers = {
    avgSalary: { field: 'salary', ...avgReducer },
    avgAge: {
      field: 'age',
      ...avgReducer,
      pivotColumn: {
        inheritFromColumn: 'preferredLanguage',
        defaultWidth: 500,
      },
    },
  };
  //#endregion
}

{
  //#region combining-layers
  const pivotBy = [
    { field: 'country' },
    {
      field: 'canDesign',
      column: ({ column }) => ({
        header: column.pivotGroupKey === 'yes' ? 'Designer' : 'Non-designer',
      }),
    },
  ];

  const aggregationReducers = {
    salary: {
      field: 'salary',
      reducer: 'avg',
      pivotColumn: {
        defaultSortable: true,
      },
    },
    headcount: {
      initialValue: 0,
      reducer: (acc) => acc + 1,
      pivotColumn: {
        inheritFromColumn: false,
        header: 'Count',
      },
    },
  };

  <InfiniteTable
    pivotColumn={{
      defaultWidth: 140,
    }}
  />
  //#endregion
}

export {};

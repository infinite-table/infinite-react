// Snippets shown on customizing-pivot-columns.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSourcePivotBy,
  DataSourceProps,
  InfiniteTable,
  InfiniteTableColumnAggregator,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

{
  //#region global-the-pivotcolumn-prop
  <InfiniteTable
    pivotColumn={{
      defaultSortable: true,
      defaultWidth: 180,
    }}
  />
  //#endregion
}

{
  //#region global-the-pivotcolumn-prop-2
  <InfiniteTable
    pivotColumn={({ column }) => ({
      defaultSortable: !column.pivotTotalColumn,
    })}
  />
  //#endregion
}

{
  //#region per-pivot-field-pivotby-column
  const pivotBy: DataSourcePivotBy<Developer>[] = [
    { field: 'country' },
    {
      field: 'canDesign',
      column: {
        defaultSortable: true,
        defaultWidth: 400,
      },
    },
  ];
  //#endregion
}

{
  //#region per-pivot-field-pivotby-column-2
  const pivotBy: DataSourcePivotBy<Developer>[] = [
    { field: 'country' },
    {
      field: 'canDesign',
      column: ({ column }) => ({
        header: column.pivotGroupKey === 'yes' ? 'Designer' : 'Not a Designer',
      }),
    },
  ];
  //#endregion
}

{
  //#region per-aggregation-aggregationreducers-pivotcolumn
  const aggregationReducers: DataSourceProps<Developer>['aggregationReducers'] = {
    salary: {
      field: 'salary',
      initialValue: 0,
      reducer: (acc, sum) => acc + sum,
      pivotColumn: {
        defaultSortable: true,
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
  //#region inheriting-from-initial-columns
  const columns: InfiniteTablePropColumns<Developer> = {
    preferredLanguage: {
      field: 'preferredLanguage',
      style: { color: 'blue' },
    },
    age: {
      field: 'age',
      style: {
        color: 'magenta',
        background: 'yellow',
      },
    },
    salary: {
      field: 'salary',
      type: 'number',
      style: {
        color: 'red',
      },
    },
    canDesign: { field: 'canDesign' },
    country: { field: 'country' },
    firstName: { field: 'firstName' },
    id: { field: 'id' },
  };

  const avgReducer: InfiniteTableColumnAggregator<Developer, any> = {
    initialValue: 0,
    reducer: (acc, sum) => acc + sum,
    done: (sum, arr) => {
      return Math.floor(arr.length ? sum / arr.length : 0);
    },
  };

  const aggregationReducers: DataSourceProps<Developer>['aggregationReducers'] = {
    // will have the same configuration as the `salary` column
    avgSalary: { field: 'salary', ...avgReducer },
    avgAge: {
      field: 'age',
      ...avgReducer,
      pivotColumn: {
        // will have the same configuration as the `preferredLanguage` column
        inheritFromColumn: 'preferredLanguage',
        // but specify a custom default width
        defaultWidth: 500,
      },
    },
  };
  //#endregion
}

export {};

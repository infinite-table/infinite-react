// Code shown on the "Customizing Pivot Columns" page, one `#region` per snippet.
// Type-checked with the rest of the docs against the current source.
import * as React from 'react';
import {
  InfiniteTable,
  type DataSourcePivotBy,
  type DataSourceProps,
  type InfiniteTableColumnAggregator,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  country: string;
  preferredLanguage: string;
  canDesign: 'yes' | 'no';
  license: string;
  age: number;
  salary: number;
};

declare const columns: InfiniteTablePropColumns<Developer>;

export function PivotColumnObject() {
  return (
    //#region global-the-pivotcolumn-prop
    <InfiniteTable
      columns={columns}
      pivotColumn={{
        defaultSortable: true,
        defaultWidth: 180,
      }}
    />
    //#endregion
  );
}

export function PivotColumnFunction() {
  return (
    //#region pivot-column-function
    <InfiniteTable
      columns={columns}
      pivotColumn={({ column }) => ({
        defaultSortable: !column.pivotTotalColumn,
      })}
    />
    //#endregion
  );
}

export function pivotByColumnObject() {
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
  return pivotBy;
}

export function pivotByColumnFunction() {
  //#region pivot-by-column-function
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
  return pivotBy;
}

export function aggregationPivotColumn() {
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
  return aggregationReducers;
}

export function inheritFromColumns() {
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
  return { columns, aggregationReducers };
}

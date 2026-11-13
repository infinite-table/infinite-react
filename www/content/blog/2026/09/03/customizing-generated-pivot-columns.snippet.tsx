// Snippets shown on customizing-generated-pivot-columns.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  InfiniteTable,
  type DataSourcePivotBy,
  type DataSourcePropAggregationReducers,
  type DataSourcePropPivotBy,
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

// Some snippets write their config without a type (`const pivotBy = [{ field: 'country' }]`),
// so their `field` is a `string`. Those are checked, after the region, against
// the library types for a row type that has any string as a key.
type AnyRow = Record<string, unknown>;

// the "average" reducer the post refers to, without showing it
const avgReducer = {
  initialValue: 0,
  reducer: (acc: number, sum: number) => acc + sum,
  done: (sum: number, arr: unknown[]) => {
    return Math.floor(arr.length ? sum / arr.length : 0);
  },
};

export function PivotColumnObject() {
  return (
    //#region global-defaults-width-and-sorting
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
  const checked: DataSourcePropPivotBy<AnyRow> = pivotBy;
  return checked;
}

export function pivotByColumnFunction() {
  //#region pivot-by-column-function
  const pivotBy: DataSourcePivotBy<Developer>[] = [
    { field: 'country' },
    {
      field: 'canDesign',
      column: ({ column }) => ({
        header: column.pivotGroupKey === 'yes' ? 'Designer' : 'Non-designer',
      }),
    },
  ];
  //#endregion
  return pivotBy;
}

export function aggregationPivotColumn() {
  //#region per-aggregation-configure-one-measure
  const aggregationReducers: DataSourcePropAggregationReducers<Developer> = {
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
  return aggregationReducers;
}

export function inheritFromColumns() {
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
  const checkedColumns: InfiniteTablePropColumns<AnyRow> = columns;
  const checkedReducers: DataSourcePropAggregationReducers<AnyRow> =
    aggregationReducers;
  return { checkedColumns, checkedReducers };
}

export function inheritByField() {
  //#region inherit-by-field
  const columns = {
    stargazers: {
      field: 'stargazers_count',
      type: 'number',
    },
  };
  //#endregion
  const checked: InfiniteTablePropColumns<AnyRow> = columns;
  return checked;
}

export function inheritFromColumn() {
  //#region inherit-from-column
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
  const checked: DataSourcePropAggregationReducers<AnyRow> =
    aggregationReducers;
  return checked;
}

export function CombiningLayers() {
  //#region combining-layers
  const pivotBy: DataSourcePivotBy<Developer>[] = [
    { field: 'country' },
    {
      field: 'canDesign',
      column: ({ column }) => ({
        header: column.pivotGroupKey === 'yes' ? 'Designer' : 'Non-designer',
      }),
    },
  ];

  const aggregationReducers: DataSourcePropAggregationReducers<Developer> = {
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
    columns={columns}
    pivotColumn={{
      defaultWidth: 140,
    }}
  />
  //#endregion
  return { pivotBy, aggregationReducers };
}

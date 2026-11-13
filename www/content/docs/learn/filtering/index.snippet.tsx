// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  DataSource,
  InfiniteTable,
  type DataSourcePropFilterTypes,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  age: number;
  salary: number;
};

declare const data: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;

export function InitialFilterValue() {
  return (
    //#region specifying-an-initial-filter-value-for-the
    <DataSource<Developer>
      primaryKey="id"
      data={data}
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
        columns={columns}
      />
    </DataSource>
    //#endregion
  );
}

export function incomeFilterType() {
  //#region understanding-filter-types
  const filterTypes: DataSourcePropFilterTypes<Developer> = {
    income: {
      label: 'Income',
      emptyValues: ['', null, undefined],
      defaultOperator: 'gt',
      operators: [
        {
          name: 'gt',
          label: 'Greater than',
          fn: ({ currentValue, filterValue, emptyValues }) => {
            if (emptyValues.includes(currentValue)) {
              return true;
            }
            return currentValue > filterValue;
          },
        },
        {
          name: 'gte',
          fn: ({ currentValue, filterValue }) => currentValue >= filterValue,
          //...
        },
        {
          name: 'lt',
          fn: ({ currentValue, filterValue }) => currentValue < filterValue,
          //...
        },
        {
          name: 'lte',
          fn: ({ currentValue, filterValue }) => currentValue <= filterValue,
          //...
        },
      ],
    },
  };
  //#endregion
  return filterTypes;
}

export function FilterColumnNotBoundToField() {
  return (
    <DataSource<Developer>
      primaryKey="id"
      data={data}
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
    />
  );
}

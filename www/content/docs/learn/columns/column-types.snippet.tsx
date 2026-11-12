// Snippets shown on column-types.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  InfiniteTable,
  type InfiniteTablePropColumns,
  type InfiniteTablePropColumnTypes,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  salary: number;
};

export function ColumnTypesIntro() {
  //#region intro
  type Person = {
    name: string;
    dob: string;
    age: number;
  }
  const columns: InfiniteTablePropColumns<Person> = {
    age: {
      field: 'age',
      type: 'custom',
    },
    date: {
      field: 'dob',
      // will be type default
    },
    name: {
      field: 'name',
      // will have both of those types
      type: ['default', 'custom']
    }
  }

  const columnTypes: InfiniteTablePropColumnTypes<Person> = {
    default: {
      defaultWidth: 200
    },
    custom: {
      align: 'center'
    }
  };

  <InfiniteTable columnTypes={columnTypes} columns={columns} />
  //#endregion
  return null;
}

export function columnTypesPrecedence() {
  //#region column-type-properties-order-and-precedence
  const columns = {
    salary: {
      type: ['number', 'currency'],
    },
  };

  const numberFormatter = new Intl.NumberFormat();
  const columnTypes: InfiniteTablePropColumnTypes<Developer> = {
    number: {
      renderValue: ({ value }) => numberFormatter.format(value), // makes 12345 render as 12,345
    },
    currency: {
      renderValue: ({ value }) => `USD: ${value}`, // makes 12345 render as USD: 12345
    },
  };
  //#endregion

  // the snippet has no type annotation, so check it against the columns type here
  const typedColumns: InfiniteTablePropColumns<Developer> = columns;
  return { typedColumns, columnTypes };
}

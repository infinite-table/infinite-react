// Snippets shown on column-types.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  InfiniteTable,
} from '@infinite-table/infinite-react';

{
  //#region intro
  type Person = {
    name: string;
    dob: string;
    age: number;
  }
  const columns = {
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

  const columnTypes = {
    default: {
      width: 200
    },
    custom: {
      align: 'center'
    }
  }

  <InfiniteTable columnTypes={columnTypes} columns={columns} />
  //#endregion
}

{
  //#region column-type-properties-order-and-precedence
  const columns = {
    salary: {
      type: ['number', 'currency'],
    },
  };

  const numberFormatter = new Intl.NumberFormat();
  const columnTypes = {
    number: {
      renderValue: ({ value }) => numberFormatter.format(value), // makes 12345 render as 12,345
    },
    currency: {
      renderValue: ({ value }) => `USD: ${value}`, // makes 12345 render as USD: 12345
    },
  };
  //#endregion
}

export {};

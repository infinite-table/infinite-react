// Snippets shown on cell-and-column-styling.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  salary: number;
};

export function styleObject() {
  //#region styling-a-column-in-the-datagrid
  const column = {
    firstName: {
      style: {
        color: 'red',
        fontWeight: 'bold',
      },
    },
  };
  //#endregion

  // the snippet has no type annotation, so check it against the columns type here
  const columns: InfiniteTablePropColumns<Developer> = column;
  return columns;
}

export function styleFunction() {
  //#region styling-a-column-using-a-style-function
  const columns: InfiniteTablePropColumns<Developer> = {
    salary: {
      field: 'salary',
      type: 'number',
      style: ({ value, data, column, rowInfo }) => {
        return { // #highlight
          color: value && value > 100_000 ? 'red' : 'tomato',
        };
      },
    },
  };
  //#endregion
  return columns;
}

export function classNameString() {
  //#region styling-a-column-using-column-classname
  const columns = {
    firstName: {
      className: 'first-name-column',
    },
  };
  //#endregion

  // the snippet has no type annotation, so check it against the columns type here
  const typedColumns: InfiniteTablePropColumns<Developer> = columns;
  return typedColumns;
}

export function classNameFunction() {
  //#region styling-a-column-using-a-classname-function
  const columns: InfiniteTablePropColumns<Developer> = {
    salary: {
      field: 'salary',
      type: 'number',
      className: ({ value, data, column, rowInfo }) => {
        return value && value > 100_000 ? 'red-color' : 'tomato-color'; // #highlight
      },
    },
  }
  //#endregion
  return columns;
}

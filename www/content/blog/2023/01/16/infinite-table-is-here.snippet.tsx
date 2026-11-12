// Snippets shown on infinite-table-is-here.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import type { InfiniteTableProps } from '@infinite-table/infinite-react';

//#region typescript-generic-components
import { InfiniteTable, DataSource, type InfiniteTablePropColumns } from '@infinite-table/infinite-react'

type Person = { id: number, name: string, age: number}

const data: Person[] = [
  { id: 1, name: 'John', age: 25 },
  //...
];
const columns: InfiniteTablePropColumns<Person> = {
  id: { field: 'id' },
  name: { field: 'name' },
};

// ready to render
<DataSource<Person> data={data} primaryKey="id">
  <InfiniteTable<Person> columns={columns} />
</DataSource>
//#endregion

// The two `groupColumn` snippets show only that prop (`//...` stands for the others):
// the library component with every prop optional, so the code stays as it was published.
const AbbreviatedInfiniteTable = InfiniteTable as <T>(
  props: Partial<InfiniteTableProps<T>>,
) => React.JSX.Element;

export function GroupColumnAsAnObject() {
  const InfiniteTable = AbbreviatedInfiniteTable;
  return (
    //#region group-column-as-an-object
    <InfiniteTable
      //...
      groupColumn={{
        header: 'Groups',
      }}
    />
    //#endregion
  );
}

export function GroupColumnAsAFunction() {
  const InfiniteTable = AbbreviatedInfiniteTable;
  return (
    //#region group-column-as-a-function
    <InfiniteTable
      //...
      groupColumn={() => {
        // this allows you to affect all generated group columns in a single place
        // especially useful when the generated columns are dynamic or generated via a pivot
        return {/* ... */}
      }}
    />
    //#endregion
  );
}

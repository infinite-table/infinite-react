// Snippets shown on infinite-table-is-here.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).

//#region typescript-generic-components
import { InfiniteTable, DataSource } from '@infinite-table/infinite-react'

type Person = { id: number, name: string, age: number}

const data: Person[] = [
  { id: 1, name: 'John', age: 25 },
  //...
];
const columns = {
  id: { field: 'id' },
  name: { field: 'name' },
}

// ready to render
<DataSource<Person> data={data} primaryKey="id">
  <InfiniteTable<Person> columns={columns} />
</DataSource>
//#endregion

{
  //#region group-column-as-an-object
  <InfiniteTable
    //...
    groupColumn={{
      header: 'Groups',
    }}
  />
  //#endregion
}

{
  //#region group-column-as-a-function
  <InfiniteTable
    //...
    groupColumn={() => {
      // this allows you to affect all generated group columns in a single place
      // especially useful when the generated columns are dynamic or generated via a pivot
      return {...}
    }}
  />
  //#endregion
}

export {};

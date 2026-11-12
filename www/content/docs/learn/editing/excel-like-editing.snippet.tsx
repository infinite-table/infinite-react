// Snippets shown on excel-like-editing.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).

//#region intro
import {
  DataSource,
  InfiniteTable,
  keyboardShortcuts // #highlight
} from '@infinite-table/infinite-react';

 function App() {
  return <DataSource<Developer> primaryKey="id" data={dataSource}>
    <InfiniteTable<Developer>
      columns={columns}
      keyboardShortcuts={[
        keyboardShortcuts.instantEdit // #highlight
      ]}
    />
  </DataSource>
}
//#endregion

{
  //#region simulating-formulas-with-column-valuegetter
  const columns = {
    salary: {
      field: 'salary'
    },
    salaryK: {
      valueGetter: ({data}) => data.salary / 1000 // #highlight
    }
  }
  //#endregion
}

export {};

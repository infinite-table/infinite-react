// Snippets shown on keyboard-shortcuts.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).

//#region instant-edit
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

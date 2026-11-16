// Snippets shown on how-to-use-excel-like-editing-in-datagrid.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import type {
  DataSourceData,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  salary: number;
};

declare const dataSource: DataSourceData<Developer>;
declare const columns: InfiniteTablePropColumns<Developer>;

//#region configuring-keyboard-shortcuts
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

export {};

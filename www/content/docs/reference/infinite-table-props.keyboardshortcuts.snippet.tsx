// Snippets shown on infinite-table-props.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
};

declare const dataSource: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;

//#region keyboardshortcuts
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

export { App };

// Snippets shown on excel-like-editing.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  salary: number;
};

declare const dataSource: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;

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

export function columnsWithFormula() {
  //#region simulating-formulas-with-column-valuegetter
  const columns: InfiniteTablePropColumns<Developer> = {
    salary: {
      field: 'salary'
    },
    salaryK: {
      valueGetter: ({data}) => data.salary / 1000 // #highlight
    }
  }
  //#endregion
  return columns;
}

export { App };

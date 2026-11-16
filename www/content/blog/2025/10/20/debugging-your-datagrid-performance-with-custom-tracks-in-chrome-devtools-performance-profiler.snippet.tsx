// Snippets shown on debugging-your-datagrid-performance-with-custom-tracks-in-chrome-devtools-performance-profiler.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  DataSource as FullDataSource,
  InfiniteTable as FullInfiniteTable,
  type DataSourceProps,
  type InfiniteTableProps,
} from '@infinite-table/infinite-react';

// The post abbreviates its elements: the required props (`primaryKey`, `data`, `columns`)
// are left out. These are the library components with every prop optional, so the code
// stays as it was published, and the props it does show are still checked.
const DataSource = FullDataSource as <T>(
  props: Partial<DataSourceProps<T>>,
) => React.JSX.Element;
const InfiniteTable = FullInfiniteTable as <T>(
  props: Partial<InfiniteTableProps<T>>,
) => React.JSX.Element;

export function DebugId() {
  return (
    //#region specify-the-debugid-prop-to-see-the-datagrid-in
    <DataSource>
      <InfiniteTable
        debugId="your-datagrid" // #highlight
      />
    </DataSource>
    //#endregion
  );
}

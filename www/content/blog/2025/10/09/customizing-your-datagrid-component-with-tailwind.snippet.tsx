// Snippets shown on customizing-your-datagrid-component-with-tailwind.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  DataSource as FullDataSource,
  InfiniteTable as FullInfiniteTable,
  type DataSourceProps,
  type InfiniteTableProps,
} from '@infinite-table/infinite-react';

// The post shows only how the components nest: the required props (`primaryKey`, `data`,
// `columns`) are left out. These are the library components with every prop optional, so
// the code stays as it was published, and what it does show is still checked.
const DataSource = FullDataSource as <T>(
  props: Partial<DataSourceProps<T>>,
) => React.JSX.Element;
// (`Omit` keeps `InfiniteTable.Header`, `.Body` and `.GroupingToolbar`, and drops the call signature)
const InfiniteTable = FullInfiniteTable as Omit<typeof FullInfiniteTable, never> &
  (<T>(props: Partial<InfiniteTableProps<T>>) => React.JSX.Element);

// stands for any component of the application
declare function App(props: { children: React.ReactNode }): React.JSX.Element;

export function DefaultStructure() {
  return (
    //#region default-structure-of-infinitetable
    <DataSource>
      <InfiniteTable />
    </DataSource>
    //#endregion
  );
}

export function NestedAnywhere() {
  return (
    //#region infinitetable-can-be-nested-anywhere-inside-the
    <DataSource>
      <h1>Your DataGrid</h1>
      <App>
        <InfiniteTable /> {/* #highlight */}
      </App>
    </DataSource>
    //#endregion
  );
}

export function VerticalGroupingToolbar() {
  return (
    //#region example-structure-for-vertical-grouping-toolbar
    <DataSource>
      <InfiniteTable>
        <div className="flex flex-1 flex-row">
          <div className="flex flex-1 flex-col">
            <InfiniteTable.Header />
            <InfiniteTable.Body />
          </div>
          <InfiniteTable.GroupingToolbar orientation="vertical" /> {/* #highlight */}
        </div>
      </InfiniteTable>
    </DataSource>
    //#endregion
  );
}

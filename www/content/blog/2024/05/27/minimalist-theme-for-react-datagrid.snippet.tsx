// Snippets shown on minimalist-theme-for-react-datagrid.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
  InfiniteTable,
} from '@infinite-table/infinite-react';

{
  //#region applying-the-minimalist-theme-with-dark-mode
  <body className="infinite-theme-mode--dark infinite-theme-name--minimalist">
    <DataSource {...dataSouceProps}>
      <InfiniteTable {...props} />
    </DataSource>
  </body>
  //#endregion
}

{
  //#region applying-light-mode-via-container-classname
  <div className="infinite-theme-mode--light">
    <DataSource {...dataSouceProps}>
      <InfiniteTable {...props} />
    </DataSource>
  </div>
  //#endregion
}

{
  //#region explicitly-applying-dark-theme-via-container
  <body className="infinite-theme-mode--dark">
    <div>
      <DataSource {...dataSouceProps}>
        <InfiniteTable {...props} />
      </DataSource>
    </div>
  </body>
  //#endregion
}

export {};

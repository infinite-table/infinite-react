// Snippets shown on minimalist-theme-for-react-datagrid.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
  InfiniteTable,
  type DataSourceProps,
  type InfiniteTableProps,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  country: string;
};

// the snippets spread these - the post is about the classNames around the component
declare const dataSouceProps: DataSourceProps<Developer>;
declare const props: InfiniteTableProps<Developer>;

export function MinimalistThemeDarkMode() {
  return (
    //#region applying-the-minimalist-theme-with-dark-mode
    <body className="infinite-theme-mode--dark infinite-theme-name--minimalist">
      <DataSource {...dataSouceProps}>
        <InfiniteTable {...props} />
      </DataSource>
    </body>
    //#endregion
  );
}

export function LightModeViaContainer() {
  return (
    //#region applying-light-mode-via-container-classname
    <div className="infinite-theme-mode--light">
      <DataSource {...dataSouceProps}>
        <InfiniteTable {...props} />
      </DataSource>
    </div>
    //#endregion
  );
}

export function DarkModeViaContainer() {
  return (
    //#region explicitly-applying-dark-theme-via-container
    <body className="infinite-theme-mode--dark">
      <div>
        <DataSource {...dataSouceProps}>
          <InfiniteTable {...props} />
        </DataSource>
      </div>
    </body>
    //#endregion
  );
}

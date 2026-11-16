// Snippets shown on index.page.md, one `#region` per code block.
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

// the snippets spread these - the page is about the classNames around the component
declare const dataSouceProps: DataSourceProps<Developer>;
declare const props: InfiniteTableProps<Developer>;

//#region intro
import '@infinite-table/infinite-react/index.css';
//#endregion

//#region theme-css-imports
import '@infinite-table/infinite-react/theme/shadcn.css'
import '@infinite-table/infinite-react/theme/balsam.css'
import '@infinite-table/infinite-react/theme/minimalist.css'
import '@infinite-table/infinite-react/theme/ocean.css'
import '@infinite-table/infinite-react/theme/terminal.css'
import '@infinite-table/infinite-react/theme/sheet.css'
import '@infinite-table/infinite-react/theme/paper.css'
//#endregion

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
    //#region explicitly-applying-light-mode-via-container
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

export function CompactDensity() {
  return (
    //#region using-the-compact-density
    <div className="infinite-theme-name--minimalist infinite-density--compact">
      <DataSource {...dataSouceProps}>
        <InfiniteTable {...props} />
      </DataSource>
    </div>
    //#endregion
  );
}

//#region terminal-theme
import '@infinite-table/infinite-react/theme/terminal.css'
//#endregion

export function TerminalThemeClassNames() {
  return (
    //#region terminal-theme-class-names
    <div className="infinite-theme-name--terminal infinite-theme-mode--dark">
      <DataSource {...dataSouceProps}>
        <InfiniteTable {...props} />
      </DataSource>
    </div>
    //#endregion
  );
}

//#region sheet-theme
import '@infinite-table/infinite-react/theme/sheet.css'
//#endregion

//#region paper-theme
import '@infinite-table/infinite-react/theme/paper.css'
//#endregion

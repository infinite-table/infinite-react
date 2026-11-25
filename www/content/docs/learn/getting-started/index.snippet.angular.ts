// Code shown on the Angular version of the "Getting Started" page: the
// sibling of index.snippet.tsx, with the same `#region` names. Type-checked
// by `npm run tsc:angular`.

//#region css-import
// The CSS is a global stylesheet of your application: in angular.json, add
// it to the `styles` of the build options
//   "styles": ["@infinite-table/infinite-angular/index.css", "src/styles.css"]
// or import it at the top of src/styles.css
//   @import '@infinite-table/infinite-angular/index.css';
//#endregion

//#region typescript-types
import type {
  InfiniteTablePropColumns, // or accessible as InfiniteTableProps['columns']
  // corresponding to the `columns` input
  DataSourcePropGroupBy, // or accessible as DataSourceProps['groupBy']
  // corresponding to the `groupBy` input
} from '@infinite-table/infinite-angular';
//#endregion

//#region license-key
// app.config.ts
import type { ApplicationConfig } from '@angular/core';
import { provideInfiniteTable } from '@infinite-table/infinite-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    // #highlight the license key, for every grid of the application
    provideInfiniteTable({ licenseKey: 'your-license-key' }),
  ],
};
//#endregion

export type Types = [InfiniteTablePropColumns<{}>, DataSourcePropGroupBy<{}>];

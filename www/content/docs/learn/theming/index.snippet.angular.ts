// Code shown on the Angular version of the "Theming" page: the sibling of
// index.snippet.tsx, with the same `#region` names. Type-checked, templates
// included, by `npm run tsc:angular`.
//
// An Angular application can't import CSS from TypeScript: the CSS files are
// global styles, listed in angular.json or imported in src/styles.css. The
// page shows those as CSS; the CSS regions below say the same.
import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  country: string;
};

declare const data: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;

//#region intro
// src/styles.css
//   @import '@infinite-table/infinite-angular/index.css';
// or, in angular.json, in the `styles` of the build options:
//   "styles": ["@infinite-table/infinite-angular/index.css", "src/styles.css"]
//#endregion

//#region theme-css-imports
// src/styles.css
//   @import '@infinite-table/infinite-angular/theme/shadcn.css';
//   @import '@infinite-table/infinite-angular/theme/balsam.css';
//   @import '@infinite-table/infinite-angular/theme/minimalist.css';
//   @import '@infinite-table/infinite-angular/theme/ocean.css';
//   @import '@infinite-table/infinite-angular/theme/terminal.css';
//   @import '@infinite-table/infinite-angular/theme/sheet.css';
//   @import '@infinite-table/infinite-angular/theme/paper.css';
//#endregion

//#region terminal-theme
// src/styles.css
//   @import '@infinite-table/infinite-angular/theme/terminal.css';
//#endregion

//#region sheet-theme
// src/styles.css
//   @import '@infinite-table/infinite-angular/theme/sheet.css';
//#endregion

//#region paper-theme
// src/styles.css
//   @import '@infinite-table/infinite-angular/theme/paper.css';
//#endregion

//#region applying-the-minimalist-theme-with-dark-mode
// the root component of the application: the classes on its host element
// apply to every grid in the application
@Component({
  selector: 'app-root',
  imports: [DataSource, InfiniteTable],
  host: { class: 'infinite-theme-mode--dark infinite-theme-name--minimalist' },
  template: `
    <infinite-data-source [data]="data" primaryKey="id">
      <infinite-table [columns]="columns" />
    </infinite-data-source>
  `,
})
export class MinimalistDarkApp {
  protected readonly data = data;
  protected readonly columns = columns;
}
//#endregion

//#region explicitly-applying-dark-theme-via-container
@Component({
  selector: 'app-root',
  imports: [DataSource, InfiniteTable],
  host: { class: 'infinite-theme-mode--dark' },
  template: `
    <div>
      <infinite-data-source [data]="data" primaryKey="id">
        <infinite-table [columns]="columns" />
      </infinite-data-source>
    </div>
  `,
})
export class DarkApp {
  protected readonly data = data;
  protected readonly columns = columns;
}
//#endregion

@Component({
  selector: 'theming-snippets',
  imports: [DataSource, InfiniteTable],
  template: `
    <!-- #region explicitly-applying-light-mode-via-container -->
    <div class="infinite-theme-mode--light">
      <infinite-data-source [data]="data" primaryKey="id">
        <infinite-table [columns]="columns" />
      </infinite-data-source>
    </div>
    <!-- #endregion -->

    <!-- #region using-the-compact-density -->
    <div class="infinite-theme-name--minimalist infinite-density--compact">
      <infinite-data-source [data]="data" primaryKey="id">
        <infinite-table [columns]="columns" />
      </infinite-data-source>
    </div>
    <!-- #endregion -->

    <!-- #region terminal-theme-class-names -->
    <div class="infinite-theme-name--terminal infinite-theme-mode--dark">
      <infinite-data-source [data]="data" primaryKey="id">
        <infinite-table [columns]="columns" />
      </infinite-data-source>
    </div>
    <!-- #endregion -->
  `,
})
export class ThemingSnippets {
  protected readonly data = data;
  protected readonly columns = columns;
}

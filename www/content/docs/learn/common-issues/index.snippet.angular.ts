// Code shown on the Angular version of the "Common Issues" page: the sibling
// of index.snippet.tsx, with the same `#region` names. Type-checked,
// templates included, by `npm run tsc:angular`.
import { Component, signal } from '@angular/core';

import { DataSource } from '@infinite-table/infinite-angular';
import type { DataSourcePropGroupBy } from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  country: string;
};

declare const data: Developer[];

@Component({
  selector: 'common-issues-snippets',
  imports: [DataSource],
  template: `
    <!-- #region issue-performance-degradation-because-props-are -->
    <!-- dont do this: getGroupBy() returns a new array every time the template is checked -->
    <infinite-data-source primaryKey="id" [data]="data" [groupBy]="getGroupBy()" />
    <!-- #endregion -->

    <infinite-data-source primaryKey="id" [data]="data" [(groupBy)]="groupBy" />
  `,
})
export class CommonIssuesSnippets {
  protected readonly data = data;

  protected readonly groupField = signal<keyof Developer>('country');

  // called by the template above, on every change detection
  protected getGroupBy(): DataSourcePropGroupBy<Developer> {
    return [{ field: this.groupField() }];
  }

  //#region issue-performance-degradation-stable-props
  protected readonly groupBy = signal<DataSourcePropGroupBy<Developer>>([
    { field: 'country' },
  ]);

  // <infinite-data-source primaryKey="id" [data]="data" [(groupBy)]="groupBy" />
  //#endregion
}

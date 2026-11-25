// Code shown on the Angular version of the "TypeScript Types" page: the
// sibling of typescript-types.snippet.tsx, with the same `#region` names.
// Type-checked, templates included, by `npm run tsc:angular`.
import { Component } from '@angular/core';

//#region importing-infinitetable-and-datasource
import { InfiniteTable, DataSource } from '@infinite-table/infinite-angular';
//#endregion

//#region generic-components
type Developer = {
  id: number;

  firstName: string;
  lastName: string;

  currency: string;
  salary: number;
};

@Component({
  selector: 'developers-grid',
  imports: [DataSource, InfiniteTable],
  template: `
    <!-- the data type of both components is inferred from the bound inputs -->
    <infinite-data-source [data]="data" primaryKey="id">
      <infinite-table [columns]="columns" />
    </infinite-data-source>
  `,
})
export class DevelopersGrid {
  protected readonly data: Developer[] = [];

  // the type of the `columns` input, bound to the type of the data
  protected readonly columns: InfiniteTablePropColumns<Developer> = {
    firstName: { field: 'firstName' },
    salary: { field: 'salary', type: 'number' },
  };
}
//#endregion

//#region prop-types
import type {
  InfiniteTablePropColumns,
  // corresponding to the `columns` input
  DataSourcePropGroupBy,
  // corresponding to the `groupBy` input
} from '@infinite-table/infinite-angular';
//#endregion

//#region aggregation-reducers-type
import type { DataSourcePropAggregationReducers } from '@infinite-table/infinite-angular';
//#endregion

//#region row-style-type
import type { InfiniteTablePropRowStyle } from '@infinite-table/infinite-angular';
//#endregion

//#region column-groups-type
import type { InfiniteTablePropColumnGroups } from '@infinite-table/infinite-angular';
//#endregion

export type Types = [
  DataSourcePropGroupBy<Developer>,
  DataSourcePropAggregationReducers<Developer>,
  InfiniteTablePropRowStyle<Developer>,
  InfiniteTablePropColumnGroups,
];

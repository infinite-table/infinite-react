// Code shown on the Angular version of the "Master Detail" page: the sibling
// of overview.snippet.tsx, with the same `#region` names. Type-checked,
// templates included, by `npm run tsc:angular`.
import { Component, TemplateRef } from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  type DataSourceData,
  type InfiniteTablePropColumns,
  type InfiniteTableRowInfo,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  city: string;
  country: string;
};

type City = {
  id: number;
  cityName: string;
  country: string;
};

declare const masterColumns: InfiniteTablePropColumns<City>;
declare function renderDetail(
  rowInfo: InfiniteTableRowInfo<City>,
): TemplateRef<unknown>;

//#region loading-the-detail-datagrid-data
const detailDataFn: DataSourceData<Developer> = ({
  masterRowInfo, // #highlight
  sortInfo,
  // ...
}) => {
  return Promise.resolve([
    /* ... */
  ]);
};

// the detail DataSource, in the template the rowDetailRenderer returns:
// <ng-template #detail>
//   <infinite-data-source [data]="detailDataFn" primaryKey="id">
//     ...
//   </infinite-data-source>
// </ng-template>
//#endregion

@Component({
  selector: 'master-detail-snippets',
  imports: [DataSource, InfiniteTable],
  template: `
    <ng-template #detail>
      <infinite-data-source [data]="detailDataFn" primaryKey="id" />
    </ng-template>

    <!-- #region configuring-the-row-detail-height -->
    <!-- #highlight -->
    <infinite-table [columns]="masterColumns" [rowDetailHeight]="500" [rowDetailRenderer]="renderDetail" />
    <!-- #endregion -->

    <infinite-table
      [columns]="masterColumns"
      [rowDetailHeight]="500"
      [rowDetailRenderer]="renderDetail"
      [isRowDetailEnabled]="isRowDetailEnabled"
    />
  `,
})
export class MasterDetailSnippets {
  protected readonly masterColumns = masterColumns;
  protected readonly renderDetail = renderDetail;

  protected readonly detailDataFn = detailDataFn;

  //#region using-conditional-row-details
  // <infinite-table
  //   [columns]="masterColumns"
  //   [rowDetailHeight]="500"
  //   [rowDetailRenderer]="renderDetail"
  //   [isRowDetailEnabled]="isRowDetailEnabled" // #highlight
  // />
  protected readonly isRowDetailEnabled = (
    rowInfo: InfiniteTableRowInfo<City>,
  ) => rowInfo.data?.cityName?.includes('i') ?? false;
  //#endregion
}

// Code shown on the Angular version of the "Sorting and Filtering the Data
// Yourself" page: the sibling of
// sorting-and-filtering-the-data-yourself.snippet.tsx, with the same
// `#region` names. Type-checked, templates included, by `npm run tsc:angular`.
import { Component, signal } from '@angular/core';

import { DataSource } from '@infinite-table/infinite-angular';
import type {
  DataSourcePropFilterValue,
  DataSourceSingleSortInfo,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  country: string;
  age: number;
};

declare const rows: Developer[];

@Component({
  selector: 'own-sorting-and-filtering',
  imports: [DataSource],
  template: `
    <!-- #region intro -->
    <infinite-data-source
      primaryKey="id"
      [data]="rows"
      [(sortInfo)]="sortInfo"
      [(filterValue)]="filterValue"
      [shouldReloadData]="{ sortInfo: true, filterValue: true }"
    />
    <!-- #endregion -->
  `,
})
export class OwnSortingAndFiltering {
  protected readonly rows = rows;
  protected readonly sortInfo = signal<DataSourceSingleSortInfo<Developer>[]>(
    [],
  );
  protected readonly filterValue = signal<DataSourcePropFilterValue<Developer>>(
    [],
  );
}

//#region reusing-the-built-in-sorting-and-filtering
import {
  defaultFilterFunction,
  defaultFilterTypes,
  multisort,
} from '@infinite-table/infinite-angular';

export function sortAndFilter(
  rows: Developer[],
  sortInfo: DataSourceSingleSortInfo<Developer>[],
  filterValue: DataSourcePropFilterValue<Developer>,
) {
  const filtered = rows.filter((data, index, dataArray) =>
    defaultFilterFunction({
      data,
      index,
      dataArray,
      primaryKey: data.id,
      filterValue,
      filterTypes: defaultFilterTypes,
    }),
  );
  return multisort(sortInfo, filtered);
}
//#endregion

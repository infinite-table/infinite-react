// Code shown on the Angular version of the sorting pages: the sibling of
// single-sorting.snippet.tsx, with the same `#region` names. Type-checked,
// templates included, by `npm run tsc:angular`.
import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourcePropSortFn,
  DataSourcePropSortInfo,
  DataSourcePropSortTypes,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  age: number;
  color: string;
};

declare const data: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;

export function sortInfoShapes() {
  let sortInfo: DataSourcePropSortInfo<Developer>;
  //#region default-sort-info
  // sort by `firstName`, in ascending order
  const defaultSortInfo = { field: 'firstName', dir: 1 };
  //#endregion

  //#region sort-info
  // sort by `firstName`, in ascending order
  sortInfo = { field: 'firstName', dir: 1 };
  //#endregion

  //#region no-sort
  // no sorting
  sortInfo = null;
  //#endregion

  //#region multiple
  // sort by age in descending order, then by `firstName` in ascending order
  sortInfo = [
    { field: 'age', type: 'number', dir: -1 },
    { field: 'firstName', dir: 1 },
  ];

  // no sorting
  sortInfo = [];
  //#endregion

  return [defaultSortInfo, sortInfo];
}

//#region default-sort-types
const sortTypes: DataSourcePropSortTypes = {
  string: (a, b) => a.localeCompare(b),
  number: (a, b) => a - b,
  date: (a, b) => a - b,
};
//#endregion

const colorOrder = ['magenta', 'blue', 'green'];

@Component({
  selector: 'sorting-snippets',
  imports: [DataSource, InfiniteTable],
  template: `
    <!-- #region uncontrolled -->
    <!--
      initially render the component with ascending sorting on the firstName field
      also, note this is an array, so multiple sorting will be enabled
    -->
    <infinite-data-source
      primaryKey="id"
      [data]="data"
      [defaultSortInfo]="[{ field: 'firstName', dir: 1 }]"
    >
      <infinite-table [columns]="columns" />
    </infinite-data-source>
    <!-- #endregion -->

    <!-- #region multiple-sorting-default -->
    <!-- we want an array here -->
    <infinite-data-source primaryKey="id" [data]="data" [defaultSortInfo]="[]">
      <infinite-table [columns]="columns" />
    </infinite-data-source>
    <!-- #endregion -->

    <infinite-data-source
      primaryKey="id"
      [data]="data"
      [defaultSortInfo]="defaultSortInfoByColor"
      [sortTypes]="colorSortTypes"
    />
    <infinite-data-source
      primaryKey="id"
      [data]="data"
      [sortFunction]="sortFunction"
    />
  `,
})
export class SortingSnippets {
  protected readonly data = data;
  protected readonly columns = columns;

  //#region default-sort-info-with-type
  // <infinite-data-source [defaultSortInfo]="defaultSortInfoByColor" />
  protected readonly defaultSortInfoByColor: DataSourcePropSortInfo<Developer> =
    {
      field: 'color',
      dir: 1,
      // note this custom sort type
      type: 'color', // #highlight
    };
  //#endregion

  //#region color-sort-type
  // <infinite-data-source [sortTypes]="colorSortTypes" />
  protected readonly colorSortTypes: DataSourcePropSortTypes = {
    ...sortTypes,
    color: (a: string, b: string) =>
      colorOrder.indexOf(a) - colorOrder.indexOf(b),
  };
  //#endregion

  //#region sort-function
  // <infinite-data-source primaryKey="id" [data]="data" [sortFunction]="sortFunction" />
  protected readonly sortFunction: DataSourcePropSortFn<Developer> = (
    sortInfo,
    dataArray,
  ) => {
    // sort the dataArray according to the sortInfo
    // and return the sorted array
    return [...dataArray].sort((a, b) => {
      for (const { field, dir } of sortInfo) {
        const key = field as keyof Developer;
        if (a[key] !== b[key]) return (a[key] < b[key] ? -1 : 1) * dir;
      }
      return 0;
    });
  };
  //#endregion
}

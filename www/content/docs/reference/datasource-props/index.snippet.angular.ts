// Code shown on the Angular version of index.page.md: the sibling of
// index.snippet.tsx, with the same `#region` names (the fences marked
// `neutral` in the page are shown from the .tsx file). Type-checked,
// templates included, by `npm run tsc:angular`.
import type {
  DataSourcePropSortTypes,
  DataSourceSingleSortInfo,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  name: string;
  age: number;
  salary: number;
  license: string;
  preferredLanguage: string;
  color: string;
};

declare const data: Developer[];

//#region onrowdisabledstatechange
import { Component, signal } from '@angular/core';
import {
  DataSource,
  RowDisabledState,
  type DataSourceProps,
  type RowDisabledStateObject, // #highlight
} from '@infinite-table/infinite-angular';

@Component({
  selector: 'app-root',
  imports: [DataSource],
  template: `
    <infinite-data-source
      [data]="data"
      primaryKey="id"
      [rowDisabledState]="rowDisabledState()"
      (rowDisabledStateChange)="onRowDisabledStateChange($event)"
    />
  `,
})
export class App {
  protected readonly data = data;

  protected readonly rowDisabledState = signal<RowDisabledStateObject<number>>({
    enabledRows: true,
    disabledRows: [1, 3, 4, 5],
  });

  protected onRowDisabledStateChange(
    rowState: DataSourceProps<Developer>['rowDisabledState'],
  ) {
    // called with a RowDisabledState instance
    if (rowState instanceof RowDisabledState) {
      this.rowDisabledState.set(rowState.getState()); // #highlight
    }
  }
}
//#endregion

const colorOrder = ['magenta', 'blue', 'green'];

@Component({
  selector: 'custom-sort-type',
  imports: [DataSource],
  template: `
    <infinite-data-source
      primaryKey="id"
      [data]="data"
      [defaultSortInfo]="defaultSortInfo"
      [sortTypes]="sortTypes"
    />
  `,
})
export class CustomSortType {
  protected readonly data = data;

  //#region defaultsortinfo
  // <infinite-data-source [defaultSortInfo]="defaultSortInfo" />
  protected readonly defaultSortInfo: DataSourceSingleSortInfo<Developer> = {
    field: 'color',
    dir: 1,
    // note this custom sort type
    type: 'color',
  };
  //#endregion

  //#region defaultsortinfo-sorttypes
  // <infinite-data-source [sortTypes]="sortTypes" />
  protected readonly sortTypes: DataSourcePropSortTypes = {
    color: (a, b) => colorOrder.indexOf(a) - colorOrder.indexOf(b),
  };
  //#endregion
}

//#region filtertypes-import
import { defaultFilterTypes } from '@infinite-table/infinite-angular';
//#endregion

//#region sortfunction
import { multisort } from '@infinite-table/infinite-angular';

const arr: Developer[] = [
  /*...*/
];
const sortInfo: DataSourceSingleSortInfo<Developer>[] = [
  {
    field: 'age',
    dir: -1,
  },
  {
    field: 'name',
    dir: 1,
  },
];
multisort(sortInfo, arr);
//#endregion

export { defaultFilterTypes };

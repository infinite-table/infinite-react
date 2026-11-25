// Code shown on the Angular version of filtering-client-side.page.md: the
// sibling of filtering-client-side.snippet.tsx, with the same `#region` names.
// Type-checked, templates included, by `npm run tsc:angular`.
import { Component, signal } from '@angular/core';

import { DataSource, renderComponent } from '@infinite-table/infinite-angular';
import type {
  DataSourceFilterType,
  DataSourcePropFilterFunction,
  DataSourcePropFilterTypes,
  DataSourcePropFilterValue,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  age: number;
  salary: number;
};

declare const data: Developer[];

@Component({
  selector: 'includes-operator-icon',
  template: `<span>⊃</span>`,
})
class IncludesOperatorIcon {}

export const stringFilterType: DataSourceFilterType<Developer> = {
  label: 'Text',
  emptyValues: [''],
  defaultOperator: 'includes',
  //#region using-filter-types
  operators: [
    {
      name: 'includes',
      // an Angular component
      components: { Icon: () => renderComponent(IncludesOperatorIcon) },
      label: 'Includes',
      fn: ({ currentValue, filterValue }) => {
        return (
          typeof currentValue === 'string' &&
          typeof filterValue == 'string' &&
          currentValue.toLowerCase().includes(filterValue.toLowerCase())
        );
      },
    },
    //...
  ],
  //#endregion
};

//#region customizing-default-filter-types
import { defaultFilterTypes } from '@infinite-table/infinite-angular';
//#endregion

//#region using-a-filter-function-instead-of-the-column
import { defaultFilterFunction } from '@infinite-table/infinite-angular';

// the built-in column filtering
// <infinite-data-source [filterFunction]="defaultFilterFunction" />

// your own logic only
const byId: DataSourcePropFilterFunction<Developer> = (param) =>
  param.data.id > 100;
// <infinite-data-source [filterFunction]="byId" />

// the column filters, and your own condition
const byColumnFiltersAndId: DataSourcePropFilterFunction<Developer> = (param) =>
  defaultFilterFunction(param) && param.data.id > 100;
// <infinite-data-source [filterFunction]="byColumnFiltersAndId" />
//#endregion

@Component({
  selector: 'filtering-client-side-snippets',
  imports: [DataSource],
  template: `
    <infinite-data-source
      primaryKey="id"
      [data]="data"
      [(filterValue)]="filterValue"
    />
    <infinite-data-source
      primaryKey="id"
      [data]="data"
      [filterTypes]="filterTypes"
    />
    <infinite-data-source
      primaryKey="id"
      [data]="data"
      [filterTypes]="allFilterTypes"
    />
    <infinite-data-source
      primaryKey="id"
      [data]="data"
      [filterFunction]="defaultFilterFunction"
    />
    <infinite-data-source primaryKey="id" [data]="data" [filterFunction]="byId" />
    <infinite-data-source
      primaryKey="id"
      [data]="data"
      [filterFunction]="byColumnFiltersAndId"
    />
  `,
})
export class FilteringClientSideSnippets {
  protected readonly data = data;

  //#region using-filter-types-for-filtervalue
  // <infinite-data-source [(filterValue)]="filterValue" />
  protected readonly filterValue = signal<DataSourcePropFilterValue<Developer>>(
    [
      {
        field: 'firstName',
        filter: {
          type: 'string', // #highlight
          operator: 'includes',
          value: 'John',
        },
      },
      {
        field: 'age',
        filter: {
          type: 'number', // #highlight
          operator: 'gt',
          value: 30,
        },
      },
    ],
  );
  //#endregion

  //#region salary-filter-type
  // <infinite-data-source [filterTypes]="filterTypes" />
  protected readonly filterTypes: DataSourcePropFilterTypes<Developer> = {
    salary: {
      defaultOperator: 'gt',
      emptyValues: ['', null, undefined],
      operators: [
        /*...*/
      ],
    },
  };
  //#endregion

  protected readonly allFilterTypes = {
    ...defaultFilterTypes,
    text: stringFilterType,
  };
  protected readonly defaultFilterFunction = defaultFilterFunction;
  protected readonly byId = byId;
  protected readonly byColumnFiltersAndId = byColumnFiltersAndId;
}

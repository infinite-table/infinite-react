// Code shown on the Angular version of extending-existing-filters.page.md: the
// sibling of extending-existing-filters.snippet.tsx, with the same `#region`
// names. Type-checked, templates included, by `npm run tsc:angular`.
import { Component } from '@angular/core';

type Developer = {
  id: number;
  firstName: string;
  canDesign: boolean;
};

declare const data: Developer[];

@Component({
  selector: 'not-contains-icon',
  template: `<span>⊅</span>`,
})
class NotContainsIcon {}

//#region adding-a-new-operator-to-the-string-filter-type
import {
  defaultFilterTypes,
  renderComponent,
} from '@infinite-table/infinite-angular';

// add new operators for the `string` filter type
defaultFilterTypes.string.operators.push({
  name: 'notContains',
  // NotContainsIcon is an Angular component
  components: { Icon: () => renderComponent(NotContainsIcon) },
  label: 'Not Contains',
  fn: ({ currentValue, filterValue }) => {
    return (
      typeof currentValue === 'string' &&
      typeof filterValue == 'string' &&
      !currentValue.toLowerCase().includes(filterValue.toLowerCase())
    );
  },
});
//#endregion

//#region adding-a-new-filter-type-by-using-the
import { DataSource } from '@infinite-table/infinite-angular';
import type { DataSourcePropFilterTypes } from '@infinite-table/infinite-angular';

@Component({
  selector: 'bool-filter-type',
  imports: [DataSource],
  template: `
    <infinite-data-source
      primaryKey="id"
      [data]="data"
      [filterTypes]="filterTypes"
    />
  `,
})
export class BoolFilterType {
  protected readonly data = data;
  protected readonly filterTypes: DataSourcePropFilterTypes<Developer> = {
    bool: {
      defaultOperator: 'eq',
      emptyValues: [null],
      operators: [
        {
          name: 'eq',
          label: 'Equals',
          fn: ({ currentValue, filterValue }) => currentValue === filterValue,
        },
      ],
    },
  };
}
//#endregion

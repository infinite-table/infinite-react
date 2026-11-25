// Code shown on the Angular version of the "Column Rendering" page: the
// sibling of column-rendering.use-infinite-header-cell.snippet.tsx, with the
// same `#region` name. Type-checked, templates included, by
// `npm run tsc:angular`.

type Employee = {
  id: number;
  firstName: string;
  lastName: string;
};

//#region use-infinite-header-cell
import { Component } from '@angular/core';
import {
  injectHeaderCell,
  renderComponent,
} from '@infinite-table/infinite-angular';
import type { InfiniteTableColumn } from '@infinite-table/infinite-angular';

@Component({
  selector: 'custom-header',
  template: `<b>{{ headerCell().column.field }}</b>`,
})
class CustomHeader {
  protected readonly headerCell = injectHeaderCell<Employee>(); // #highlight
}

const nameColumn: InfiniteTableColumn<Employee> = {
  field: 'firstName',
  header: () => renderComponent(CustomHeader),
};
//#endregion

export { nameColumn };

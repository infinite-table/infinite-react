// Code shown on the Angular version of the "Column Headers" page: the sibling
// of column-headers.customizing-the-menu-icon.snippet.tsx, with the same
// `#region` name. Type-checked, templates included, by `npm run tsc:angular`.
import type { InfiniteTableColumn } from '@infinite-table/infinite-angular';

type Person = {
  id: string;
  firstName: string;
};

//#region customizing-the-menu-icon
import { Component } from '@angular/core';
import {
  injectHeaderCell,
  renderComponent,
} from '@infinite-table/infinite-angular';

/// ...

@Component({
  selector: 'custom-menu-icon',
  template: `🔧 {{ headerCell().column.id }}`,
})
class CustomMenuIcon {
  protected readonly headerCell = injectHeaderCell(); // #highlight
}

function renderMenuIcon() {
  return renderComponent(CustomMenuIcon);
}
//#endregion

// the function above is what `column.renderMenuIcon` is set to
export const menuIconInjectColumn: InfiniteTableColumn<Person> = {
  field: 'firstName',
  renderMenuIcon,
};

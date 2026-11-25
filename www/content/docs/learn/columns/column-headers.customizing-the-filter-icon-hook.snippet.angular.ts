// Code shown on the Angular version of the "Column Headers" page: the sibling
// of column-headers.customizing-the-filter-icon-hook.snippet.tsx, with the
// same `#region` name. Type-checked, templates included, by
// `npm run tsc:angular`.
import type { InfiniteTableColumn } from '@infinite-table/infinite-angular';

type Person = {
  id: string;
  firstName: string;
};

//#region customizing-the-filter-icon-hook
import { Component } from '@angular/core';
import {
  injectHeaderCell,
  renderComponent,
} from '@infinite-table/infinite-angular';

/// ...

@Component({
  selector: 'custom-filter-icon',
  template: `{{ headerCell().filtered ? '🔥' : '' }}`,
})
class CustomFilterIcon {
  protected readonly headerCell = injectHeaderCell(); // #highlight
}

function renderFilterIcon() {
  return renderComponent(CustomFilterIcon);
}
//#endregion

// the function above is what `column.renderFilterIcon` is set to
export const filterIconInjectColumn: InfiniteTableColumn<Person> = {
  field: 'firstName',
  renderFilterIcon,
};

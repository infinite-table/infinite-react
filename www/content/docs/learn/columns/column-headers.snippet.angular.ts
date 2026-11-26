// Code shown on the Angular version of the "Column Headers" page: the sibling
// of column-headers.snippet.tsx, with the same `#region` names (the regions
// that are the same code for every framework are shown from the .tsx file).
// Type-checked, templates included, by `npm run tsc:angular`.
import type { InfiniteTableColumn } from '@infinite-table/infinite-angular';

type Person = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
};

//#region customizing-the-column-sort-icon-hook
import { Component, computed } from '@angular/core';
import {
  injectHeaderCell,
  renderComponent,
} from '@infinite-table/infinite-angular';

/// ...

@Component({
  selector: 'custom-sort-icon',
  template: `{{ icon() }}`,
})
class SortIcon {
  private readonly headerCell = injectHeaderCell(); // #highlight

  protected readonly icon = computed(() => {
    const { columnSortInfo } = this.headerCell();
    if (!columnSortInfo) {
      return ' 🤷‍♂️';
    }
    return columnSortInfo.dir === 1 ? '▲' : '▼';
  });
}

function renderSortIcon() {
  return renderComponent(SortIcon);
}
//#endregion

// the function above is what `column.renderSortIcon` is set to
export const sortIconInjectColumn: InfiniteTableColumn<Person> = {
  field: 'firstName',
  renderSortIcon,
};

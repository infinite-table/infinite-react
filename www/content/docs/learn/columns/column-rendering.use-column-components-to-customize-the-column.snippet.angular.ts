// Code shown on the Angular version of the "Column Rendering" page: the
// sibling of
// column-rendering.use-column-components-to-customize-the-column.snippet.tsx,
// with the same `#region` name. Type-checked, templates included, by
// `npm run tsc:angular`.
import { Component } from '@angular/core';
import {
  InfiniteRender,
  injectColumnCellChildren,
  injectHeaderCell,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
};

//#region use-column-components-to-customize-the-column
import type { InfiniteTableColumn } from '@infinite-table/infinite-angular';

// the host element of the component is the cell
@Component({
  selector: 'div[redColumnCell]',
  imports: [InfiniteRender],
  host: { style: 'color: red' },
  // the default content of the cell
  template: `<ng-container [infiniteRender]="children()" />`,
})
class ColumnCell {
  protected readonly children = injectColumnCellChildren();
}

// the host element of the component is the header cell
@Component({
  selector: 'div[redHeaderCell]',
  imports: [InfiniteRender],
  host: { style: 'color: red' },
  template: `<ng-container
      [infiniteRender]="headerCell().renderBag.sortIcon"
    />First name`,
})
class HeaderCell {
  protected readonly headerCell = injectHeaderCell<Developer>();
}

const nameColumn: InfiniteTableColumn<Developer> = {
  header: 'Name',
  field: 'firstName',
  components: {
    ColumnCell,
    HeaderCell,
  },
};
//#endregion

export { nameColumn };

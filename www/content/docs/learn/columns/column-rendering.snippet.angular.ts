// Code shown on the Angular version of the "Column Rendering" page: the
// sibling of column-rendering.snippet.tsx, with the same `#region` names (the
// regions that are the same code for every framework are shown from the .tsx
// file). Type-checked, templates included, by `npm run tsc:angular`.
import { TemplateRef, viewChild } from '@angular/core';

import {
  InfiniteRender,
  injectColumnCellChildren,
} from '@infinite-table/infinite-angular';

type Employee = {
  id: number;
  firstName: string;
  lastName: string;
};

// used as `T` in the snippets below
type T = {
  id: number;
  person: {
    salary: number;
  };
};

// this snippet shows its imports, which the other snippets in the file use as well
//#region use-infinite-column-cell
import { Component } from '@angular/core';
import {
  injectColumnCell,
  renderComponent,
} from '@infinite-table/infinite-angular';
import type { InfiniteTableColumn } from '@infinite-table/infinite-angular';

@Component({
  selector: 'custom-name',
  // the content of the cell, without a wrapper element
  host: { style: 'display: contents' },
  template: `<b>{{ cell().data?.firstName }}</b>, {{ cell().data?.lastName }}`,
})
class CustomName {
  protected readonly cell = injectColumnCell<Employee>(); // #highlight
}

const nameColumn: InfiniteTableColumn<Employee> = {
  header: 'Employee Name',
  renderValue: () => renderComponent(CustomName),
};
//#endregion

//#region use-rendervalue-and-render-to-display-custom
type Developer = { country: string; name: string; id: string };

@Component({
  selector: 'country-info',
  template: `<div>Country: {{ cell().value }}</div>`,
})
class CountryInfo {
  protected readonly cell = injectColumnCell<Developer>(); // #highlight
}

const columns = {
  country: {
    field: 'country',
    renderValue: () => renderComponent(CountryInfo),
  },
};
//#endregion

// the snippet has no type annotation, so check it against the column type here
// (without `field`, which is just a `string` in an object that has no annotation)
export const checkedColumns: Record<
  string,
  Omit<InfiniteTableColumn<Developer>, 'field'>
> = columns;

//#region use-column-components-to-customize-the-column
// a component specified in column.components.ColumnCell:
// its host element is the cell
@Component({
  selector: 'div[customColumnCell]',
  imports: [InfiniteRender],
  // the default content of the cell, where React renders `children`
  template: `<ng-container [infiniteRender]="children()" />`,
})
class ColumnCell {
  protected readonly children = injectColumnCellChildren(); // #highlight
}
//#endregion

//#region rendering-pipeline-renderbag-value-in-render
@Component({
  selector: 'hello-world-column',
  imports: [InfiniteRender],
  template: `
    <ng-template #bold let-value>
      <b>{{ value }}</b>
    </ng-template>

    <ng-template #hello let-renderBag="renderBag">
      <div>Hello <ng-container [infiniteRender]="renderBag.value" />!</div>
    </ng-template>
  `,
})
class HelloWorldColumn {
  private readonly bold = viewChild.required<TemplateRef<unknown>>('bold');
  private readonly hello = viewChild.required<TemplateRef<unknown>>('hello');

  readonly column: InfiniteTableColumn<T> = {
    valueGetter: () => 'world',
    renderValue: ({ value }) => { // #highlight
      // at this stage, `value` is 'world' and `renderBag.value` has the same value, 'world'
      return this.bold();
    },

    render: ({ renderBag }) => {
      // at this stage `value` is 'world'
      // but `renderBag.value` is the #bold template, as this was the value returned by `renderValue`
      return this.hello();
    }, // #highlight
  };
}
//#endregion

export function renderBagGroupIcon() {
  //#region rendering-pipeline-renderbag-groupicon
  const column: InfiniteTableColumn<T> = {
    renderGroupIcon: ({ renderBag }) => { // #highlight
      return [' [ ', renderBag.groupIcon, ' ] '];
    },
    render: ({ renderBag }) => {
      return [
        // use the groupIcon from the renderBag
        renderBag.groupIcon, // #highlight
        renderBag.value,
      ];
    },
  };
  //#endregion
  return column;
}

//#region rendering-pipeline-renderbag-selectioncheckbox
@Component({
  selector: 'custom-selection-column',
  template: `
    <ng-template
      #selection
      let-rowSelected="rowSelected"
      let-isGroupRow="isGroupRow"
      let-toggleRow="toggleCurrentRowSelection"
      let-toggleGroupRow="toggleCurrentGroupRowSelection"
    >
      <!-- rowSelected is null for a group row with an indeterminate state -->
      <div (click)="isGroupRow ? toggleGroupRow() : toggleRow()">
        [ {{ rowSelected === null ? '-' : rowSelected ? 'x' : 'o' }} ]
      </div>
    </ng-template>
  `,
})
class CustomSelectionColumn {
  private readonly selection =
    viewChild.required<TemplateRef<unknown>>('selection');

  readonly column: InfiniteTableColumn<T> = {
    renderSelectionCheckBox: (params) => { // #highlight
      if (!params.rowInfo) {
        // the function is also called for the column header
        return params.renderBag.selectionCheckBox;
      }
      // you could return renderBag.selectionCheckBox to have the default checkbox
      return this.selection();
    },
    render: ({ renderBag }) => {
      return [ // #highlight
        // use the selectionCheckBox from the renderBag
        renderBag.selectionCheckBox,
        renderBag.groupIcon,
        renderBag.value,
      ];
    },
  };
}
//#endregion

export { nameColumn, ColumnCell, HelloWorldColumn, CustomSelectionColumn };

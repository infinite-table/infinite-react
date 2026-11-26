// Code shown on the Angular version of infinite-table-props.page.md: the
// sibling of infinite-table-props.snippet.tsx, with the same `#region` names
// (the fences marked `neutral` in the page are shown from the .tsx file).
// Type-checked, templates included, by `npm run tsc:angular`.
import { Component, ElementRef, inject, signal } from '@angular/core';
import type { AfterViewInit } from '@angular/core';
import {
  InfiniteRender,
  injectColumnCell,
  injectColumnCellChildren,
  injectColumnEditor,
  injectHeaderCell,
  injectHeaderCellChildren,
} from '@infinite-table/infinite-angular';
import type {
  InfiniteTablePropColumnGroupVisibility,
  InfiniteTablePropColumns,
  TableRenderRange,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  country: string;
  city: string;
};
type DATA_TYPE = Developer;

declare const data: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;
declare const style: Record<string, string>;
declare const emoji: string;

@Component({
  //#region columns-components-columncell-dom-ref
  // an attribute selector on a div: the host element of the component is the
  // root DOM element of the cell
  selector: 'div[myColumnCell]',
  //#endregion
  template: `{{ cell().value }}`,
})
export class MyColumnCell {
  //#region columns-components-columncell
  // the cell (value, rowInfo, column, ...), as a signal
  protected readonly cell = injectColumnCell<DATA_TYPE>();
  //#endregion
}

//#region columns-components-columncell-signature
@Component({
  selector: 'div[customCell]',
  imports: [InfiniteRender],
  // the default content of the cell
  template: `<ng-container [infiniteRender]="children()" />`,
})
class CustomComponent {
  protected readonly children = injectColumnCellChildren();
}
//#endregion

//#region columns-components-columncell-example
@Component({
  selector: 'div[exampleCell]',
  imports: [InfiniteRender],
  host: { class: 'extra-cls', '[style]': 'style' },
  template: `<ng-container [infiniteRender]="children()" />
    <div style="flex: 1"></div>
    {{ emoji }}`,
})
class ExampleCellComponent {
  protected readonly children = injectColumnCellChildren();

  protected readonly style = style;
  protected readonly emoji = emoji;
}
//#endregion

//#region columns-components-editor
@Component({
  selector: 'input[myColumnEditor]',
  host: {
    type: 'text',
    '[readOnly]': 'editor.readOnly()',
    '(input)': 'onInput()',
    '(keydown)': 'onKeyDown($event)',
    '(blur)': 'onBlur()',
  },
  template: '',
})
export class InfiniteTableColumnEditor implements AfterViewInit {
  protected readonly editor = injectColumnEditor();

  private readonly input =
    inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;

  constructor() {
    this.input.value = this.editor.initialValue ?? '';
  }

  ngAfterViewInit() {
    this.input.focus();
  }

  protected onInput() {
    this.editor.setValue(this.input.value);
  }

  protected onKeyDown(event: KeyboardEvent) {
    const { key } = event;
    if (key === 'Enter' || key === 'Tab') {
      this.editor.confirmEdit();
      // the grid would start a new edit on this key
      event.stopPropagation();
      if (key === 'Tab') {
        event.preventDefault();
      }
    } else if (key === 'Escape') {
      this.editor.cancelEdit();
    } else {
      event.stopPropagation();
    }
  }

  protected onBlur() {
    // not after Enter or Escape, which already ended the edit
    if (this.editor.api.isEditInProgress()) {
      this.editor.confirmEdit();
    }
  }
}
//#endregion

@Component({
  //#region columns-components-headercell-dom-ref
  // an attribute selector on a div: the host element of the component is the
  // root DOM element of the header cell
  selector: 'div[myHeaderCell]',
  //#endregion
  template: `{{ headerCell().column.id }}`,
})
export class MyHeaderCell {
  //#region columns-components-headercell
  // the header cell (column, columnApi, sort and filter info, ...), as a signal
  protected readonly headerCell = injectHeaderCell<DATA_TYPE>();
  //#endregion
}

//#region columns-components-headercell-signature
@Component({
  selector: 'div[customHeaderCell]',
  imports: [InfiniteRender],
  // the default content of the header cell
  template: `<ng-container [infiniteRender]="children()" />`,
})
class CustomHeaderComponent {
  protected readonly children = injectHeaderCellChildren();
}
//#endregion

//#region columns-components-headercell-example
@Component({
  selector: 'div[exampleHeaderCell]',
  imports: [InfiniteRender],
  host: { class: 'extra-cls', '[style]': 'style' },
  template: `<ng-container [infiniteRender]="children()" />
    <div style="flex: 1"></div>
    {{ emoji }}`,
})
class ExampleHeaderComponent {
  protected readonly children = injectHeaderCellChildren();

  protected readonly style = style;
  protected readonly emoji = emoji;
}
//#endregion

//#region columngroupvisibility
@Component({
  selector: 'developers-grid',
  imports: [InfiniteTable],
  template: `
    <infinite-table
      [(columnGroupVisibility)]="columnGroupVisibility"
      [columns]="columns"
    />
  `,
})
export class DevelopersGrid {
  protected readonly columns = columns;

  protected readonly columnGroupVisibility =
    signal<InfiniteTablePropColumnGroupVisibility>({
      country: false,
      city: true,
    });
}
//#endregion

//#region keyboardshortcuts
import { keyboardShortcuts } from '@infinite-table/infinite-angular';
//#endregion

//#region onrenderrangechange-debounced
import {
  debounce,
  InfiniteTable,
  DataSource,
} from '@infinite-table/infinite-angular';

@Component({
  selector: 'app-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="data">
      <infinite-table
        [columns]="columns"
        (renderRangeChange)="onRenderRangeChange($event)"
      />
    </infinite-data-source>
  `,
})
export class App {
  protected readonly data = data;
  protected readonly columns = columns;

  protected readonly onRenderRangeChange = debounce(
    (range: TableRenderRange) => {
      console.log(range.start, range.end);
    },
    { wait: 100 },
  );
}
//#endregion

export {
  CustomComponent,
  ExampleCellComponent,
  CustomHeaderComponent,
  ExampleHeaderComponent,
  keyboardShortcuts,
};

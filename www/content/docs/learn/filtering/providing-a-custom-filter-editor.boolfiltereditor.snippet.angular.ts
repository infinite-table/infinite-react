// Code shown on the Angular version of providing-a-custom-filter-editor.page.md: the sibling of
// providing-a-custom-filter-editor.boolfiltereditor.snippet.tsx, with the same `#region` names.
// Type-checked, templates included, by `npm run tsc:angular`.

type Developer = {
  id: number;
  firstName: string;
  canDesign: boolean;
};

//#region boolfiltereditor
import { Component } from '@angular/core';
import {
  InfiniteCheckBox,
  injectColumnFilterEditor,
} from '@infinite-table/infinite-angular';

@Component({
  selector: 'div[boolFilterEditor]',
  imports: [InfiniteCheckBox],
  host: {
    '[class]': 'editor.className',
    style: 'text-align: center',
  },
  template: `
    <input
      infiniteCheckBox
      [checked]="editor.value()"
      (checkedChange)="onChange($event)"
    />
  `,
})
export class BoolFilterEditor {
  protected readonly editor = injectColumnFilterEditor<Developer>(); // #highlight

  protected onChange(newValue: boolean | null) {
    const value = this.editor.value();
    if (value === true) {
      // after the value was true, make it go to indeterminate state
      newValue = null;
    }
    if (value === null) {
      // from indeterminate, goto false
      newValue = false;
    }
    this.editor.setValue(newValue);
  }
}
//#endregion

// Code shown on the Angular version of custom-editor.page.md: the sibling of
// custom-editor.snippet.tsx, with the same `#region` names (the `intro`
// region is the same code for every framework, so the page shows it from the
// .tsx file). Type-checked, templates included, by `npm run tsc:angular`.

//#region customeditor-tsx
import { Component, ElementRef, viewChild } from '@angular/core';
import type { AfterViewInit } from '@angular/core';
import { injectColumnEditor } from '@infinite-table/infinite-angular';

@Component({
  selector: 'custom-editor',
  template: `
    <div>
      <input
        #input
        style="width: 100%"
        [value]="editor.initialValue"
        (keydown)="onKeydown($event)"
      />
    </div>
  `,
})
export class CustomEditor implements AfterViewInit {
  protected readonly editor = injectColumnEditor(); // #highlight

  private readonly input =
    viewChild.required<ElementRef<HTMLInputElement>>('input');

  ngAfterViewInit() {
    this.input().nativeElement.focus();
  }

  protected onKeydown(event: KeyboardEvent) {
    const { key } = event;
    if (key === 'Enter' || key === 'Tab') {
      this.editor.confirmEdit(this.input().nativeElement.value);
    } else if (key === 'Escape') {
      this.editor.cancelEdit();
    } else {
      event.stopPropagation();
    }
  }
}
//#endregion

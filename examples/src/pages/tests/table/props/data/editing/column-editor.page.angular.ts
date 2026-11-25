import {
  AfterViewInit,
  Component,
  ElementRef,
  viewChild,
} from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  injectColumnEditor,
} from '@infinite-table/infinite-angular';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';

import { type Developer, data, height100DomProps } from './common';

@Component({
  selector: 'custom-editor',
  template: `
    <div style="border: 2px solid red">
      <input
        #input
        style="width: 100%"
        [value]="editor.initialValue"
        (keydown)="onKeydown($event)"
      />
    </div>
  `,
})
class CustomEditor implements AfterViewInit {
  protected readonly editor = injectColumnEditor();

  private readonly input =
    viewChild.required<ElementRef<HTMLInputElement>>('input');

  ngAfterViewInit() {
    this.input().nativeElement.focus();
  }

  protected onKeydown(event: KeyboardEvent) {
    const { key } = event;
    if (key === 'Enter' || key === 'Tab') {
      this.editor.confirmEdit(this.input().nativeElement.value + 'ABC');
    } else if (key === 'Escape') {
      this.editor.cancelEdit();
    } else {
      event.stopPropagation();
    }
  }
}

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [data]="data" primaryKey="id">
      <infinite-table
        [domProps]="domProps"
        [columnDefaultEditable]="true"
        [columnDefaultWidth]="150"
        [columnMinWidth]="50"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class ColumnEditorPage {
  protected readonly data = data;
  protected readonly domProps = height100DomProps;
  protected readonly columns: InfiniteTablePropColumns<Developer> = {
    id: {
      field: 'id',
    },
    firstName: {
      field: 'firstName',
      components: {
        Editor: CustomEditor,
      },
    },
    age: {
      field: 'age',
      type: 'number',
      defaultEditable: false,
    },
    stack: { field: 'stack', renderMenuIcon: false },
    currency: { field: 'currency' },
  };
}

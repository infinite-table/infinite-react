import { Component, ElementRef, viewChild } from '@angular/core';
import type { AfterViewInit } from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  injectColumnEditor,
} from '@infinite-table/infinite-angular';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  currency: string;
  stack: string;
  hobby: string;
  salary: string;
};
const dataSource: Developer[] = [
  {
    id: 1,
    firstName: 'John',
    currency: 'USD',
    stack: 'frontend',
    hobby: 'gaming',
    salary: 'USD 1000',
  },
  {
    id: 2,
    firstName: 'Jane',
    currency: 'EUR',
    stack: 'backend',
    hobby: 'reading',
    salary: 'EUR 2000',
  },
  {
    id: 3,
    firstName: 'Jack',
    currency: 'GBP',
    stack: 'frontend',
    hobby: 'gaming',
    salary: 'GBP 3000',
  },
  {
    id: 4,
    firstName: 'Jill',
    currency: 'USD',
    stack: 'backend',
    hobby: 'reading',
    salary: 'USD 4000',
  },
];

@Component({
  selector: 'custom-editor',
  template: `
    <div
      style="background: #ad1; padding: 5px; width: 100%; height: 100%; position: absolute; left: 0; top: 0"
    >
      <input
        #input
        style="width: 100%; height: 100%"
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
      this.editor.confirmEdit(this.input().nativeElement.value);
    } else if (key === 'Escape') {
      this.editor.cancelEdit();
    } else {
      event.stopPropagation();
    }
  }
}

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 80, defaultEditable: false },

  salary: {
    components: {
      // reference to the custom editor component
      Editor: CustomEditor,
    },

    defaultWidth: 320,
    field: 'salary',
    header: 'Salary - edit accepts numbers only',
    style: { color: 'tomato' },
    getValueToEdit: ({ value }) => {
      return parseInt(value.substr(4), 10);
    },
    getValueToPersist: ({ value, data }) => {
      return `${data!.currency} ${parseInt(value, 10)}`;
    },
    shouldAcceptEdit: ({ value }) => {
      return parseInt(value, 10) == value;
    },
  },

  firstName: {
    field: 'firstName',
    header: 'Name',
  },
  currency: {
    field: 'currency',
    header: 'Currency',
  },
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="dataSource">
      <infinite-table
        debugId="custom-editor-hooks-example"
        [columns]="columns"
        [columnDefaultEditable]="true"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
}

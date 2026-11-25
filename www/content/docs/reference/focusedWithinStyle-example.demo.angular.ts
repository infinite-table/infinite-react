import { Component, TemplateRef, viewChild } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { InfiniteTableColumn } from '@infinite-table/infinite-angular';

import { data } from './data';
import type { Person } from './data';

const focusedWithinStyle = {
  outline: '3px solid tomato',
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [data]="data" primaryKey="Id">
      <infinite-table
        debugId="focusedWithinStyle-example"
        [focusedWithinStyle]="focusedWithinStyle"
        [columns]="columns"
      />
    </infinite-data-source>

    <ng-template #inputCell let-value="value">
      <input type="text" [value]="value" />
    </ng-template>
  `,
})
export default class App {
  protected readonly data = data;
  protected readonly focusedWithinStyle = focusedWithinStyle;

  private readonly inputCell =
    viewChild.required<TemplateRef<unknown>>('inputCell');

  protected readonly columns: Record<string, InfiniteTableColumn<Person>> = {
    id: {
      field: 'Id',
      type: 'number',
      defaultSortable: true,
      defaultWidth: 80,
    },
    firstName: {
      field: 'FirstName',
      render: () => this.inputCell(),
    },
    age: { field: 'Age', type: 'number' },
  };
}

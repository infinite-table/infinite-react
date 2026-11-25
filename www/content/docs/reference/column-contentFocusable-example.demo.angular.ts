import { Component, TemplateRef, viewChild } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="dataSource">
      <infinite-table
        debugId="column-contentFocusable-example"
        [columns]="columns"
      />
    </infinite-data-source>

    <!-- #highlight the focusable cell content -->
    <ng-template #input let-value="value">
      <input
        type="text"
        [value]="value"
        style="background: white; color: black; padding: 2px 10px"
      />
    </ng-template>
    <!-- #endhighlight -->
  `,
})
export default class App {
  protected readonly dataSource = dataSource;

  private readonly inputTemplate =
    viewChild.required<TemplateRef<unknown>>('input');

  protected readonly columns: InfiniteTablePropColumns<Developer> = {
    id: { field: 'id', defaultWidth: 80 },
    stack: {
      field: 'stack',
      // this makes the column content focusable
      contentFocusable: true,
      renderValue: () => this.inputTemplate(),
    },
    firstName: {
      field: 'firstName',
    },
    preferredLanguage: {
      field: 'preferredLanguage',
      // this makes the column content focusable
      contentFocusable: true,
      renderValue: () => this.inputTemplate(),
    },
  };
}

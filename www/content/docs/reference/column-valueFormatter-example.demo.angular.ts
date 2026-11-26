import { Component, TemplateRef, viewChild } from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  renderTemplate,
} from '@infinite-table/infinite-angular';
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
        debugId="column-valueFormatter-example"
        [columns]="columns"
        [columnDefaultWidth]="200"
      />
    </infinite-data-source>

    <!-- #highlight the markup the formatter returns -->
    <ng-template
      #fullName
      let-data="data"
      let-isGroupRow="isGroupRow"
      let-value="value"
    >
      @if (isGroupRow) {
        <b>{{ value }}</b>
      } @else {
        <b>
          <pre>{{ data.firstName }}, {{ data.lastName }}</pre>
        </b>
      }
    </ng-template>
    <!-- #endhighlight -->
  `,
})
export default class App {
  protected readonly dataSource = dataSource;

  private readonly fullNameTemplate =
    viewChild.required<TemplateRef<unknown>>('fullName');

  protected readonly columns: InfiniteTablePropColumns<Developer> = {
    id: { field: 'id', defaultWidth: 80 },
    name: {
      header: 'Full Name',
      valueFormatter: ({ data, isGroupRow, value }) => {
        return renderTemplate(this.fullNameTemplate(), {
          data,
          isGroupRow,
          value,
        });
      },
    },

    preferredLanguage: { field: 'preferredLanguage' },
    stack: { field: 'stack' },
  };
}

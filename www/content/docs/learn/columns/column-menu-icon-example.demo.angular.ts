import { Component, TemplateRef, viewChild } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const domProps = {
  style: {
    minHeight: 300,
  },
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="dataSource">
      <infinite-table
        debugId="column-menu-icon-example"
        [domProps]="domProps"
        [columns]="columns"
      />
    </infinite-data-source>

    <ng-template #globe>
      <div>🌎</div>
    </ng-template>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly domProps = domProps;

  private readonly globeTemplate =
    viewChild.required<TemplateRef<unknown>>('globe');

  protected readonly columns: InfiniteTablePropColumns<Developer> = {
    id: {
      field: 'id',
      defaultWidth: 80,
      renderMenuIcon: false,
    },

    name: {
      header: 'Name', // custom column header label
      valueGetter: ({ data }) => `${data.firstName} ${data.lastName}`,

      // custom menu icon
      renderMenuIcon: () => this.globeTemplate(), // #highlight
    },
    age: {
      field: 'age',
      header: 'Age',
      renderMenuIcon: ({ column }) => {
        return `🔧 ${column.id}`;
      },
    },
  };
}

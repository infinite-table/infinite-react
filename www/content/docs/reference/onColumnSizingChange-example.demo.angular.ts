import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  InfiniteTableColumnGroup,
  InfiniteTablePropColumnSizing,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

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

const columns: InfiniteTablePropColumns<Developer> = {
  currency: {
    field: 'currency',
    columnGroup: 'finance',
  },
  salary: {
    field: 'salary',
    columnGroup: 'finance',
  },
  country: {
    field: 'country',
    columnGroup: 'regionalInfo',
    maxWidth: 400,
  },
  preferredLanguage: {
    field: 'preferredLanguage',
    columnGroup: 'regionalInfo',
  },
  id: { field: 'id' },
  firstName: {
    field: 'firstName',
  },
  stack: {
    field: 'stack',
  },
};

const columnGroups: Record<string, InfiniteTableColumnGroup> = {
  regionalInfo: {
    header: 'Regional Info',
  },
  finance: {
    header: 'Finance',
    columnGroup: 'regionalInfo',
  },
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable, JsonPipe],
  template: `
    <p style="color: var(--infinite-cell-color)">
      Current column sizing:
      <code>
        <pre>{{ columnSizing() | json }}</pre>
      </code>
    </p>
    <infinite-data-source primaryKey="id" [data]="dataSource">
      <infinite-table
        debugId="onColumnSizingChange-example"
        [(columnSizing)]="columnSizing"
        [columnGroups]="columnGroups"
        [columns]="columns"
        [columnDefaultWidth]="100"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly columnGroups = columnGroups;

  // #highlight controlled: two-way bound, the grid writes the new sizes back
  protected readonly columnSizing = signal<InfiniteTablePropColumnSizing>({
    salary: {
      maxWidth: 130,
      width: 80,
    },
    currency: {
      maxWidth: 130,
      width: 80,
    },
  });
  // #endhighlight
}

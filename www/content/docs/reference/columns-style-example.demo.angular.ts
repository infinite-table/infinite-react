import { Component } from '@angular/core';

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

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    style: {
      background: 'gray',
      color: 'white',
    },
  },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  salary: {
    field: 'salary',
    type: 'number',
    style: ({ value }) => {
      return {
        color: value && value > 100_000 ? 'red' : 'currentColor',
      };
    },
  },
  stack: { field: 'stack' },
  country: { field: 'country' },
  age: { field: 'age', type: 'number' },

  currency: { field: 'currency', type: 'number' },
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="dataSource">
      <infinite-table
        debugId="columns-style-example"
        [columns]="columns"
        [columnDefaultWidth]="200"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
}

import { Component, ViewEncapsulation } from '@angular/core';

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
    defaultWidth: 80,
  },
  firstName: { field: 'firstName' },

  salary: {
    field: 'salary',
    type: 'number',
    className: ({ value }) => {
      return value && value > 100_000 ? 'red-color' : 'tomato-color'; // #highlight
    },
  },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
  country: { field: 'country' },
  age: { field: 'age', type: 'number' },

  currency: { field: 'currency', type: 'number' },
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  // the cells are rendered by the grid, not by this template:
  // the classes need global styles
  encapsulation: ViewEncapsulation.None,
  styles: `
    .red-color {
      color: red;
    }
    .tomato-color {
      color: tomato;
    }
  `,
  template: `
    <infinite-data-source primaryKey="id" [data]="dataSource">
      <infinite-table
        debugId="column-className-fn-example"
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

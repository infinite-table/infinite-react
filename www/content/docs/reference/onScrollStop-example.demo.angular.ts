import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  InfiniteTablePropColumns,
  ScrollStopInfo,
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
  monthlyBonus: number;
  birthDate: Date;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};
const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
  country: { field: 'country' },
  age: { field: 'age', type: 'number' },
  salary: { field: 'salary', type: 'number' },
  currency: { field: 'currency', type: 'number' },
  birthDate: { field: 'birthDate', type: 'number' },
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="dataSource">
      <infinite-table
        debugId="onScrollStop-example"
        (scrollStop)="onScrollStop($event)"
        [columns]="columns"
        [columnDefaultWidth]="250"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;

  protected onScrollStop({
    renderRange,
    viewportSize,
    scrollTop,
    scrollLeft,
  }: ScrollStopInfo) {
    console.log({ renderRange, viewportSize, scrollTop, scrollLeft });
  }
}

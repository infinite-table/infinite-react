import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { DataSourceApi } from '@infinite-table/infinite-angular';

type Car = {
  id: number;
  name: string;
  price: number;
};
const cars: Car[] = [
  { id: 0, name: 'Audi', price: 40000 },
  { id: 1, name: 'Volvo', price: 30000 },
  { id: 2, name: 'BMW', price: 25000 },
];
const dataSource = () => {
  return cars;
};

const columns: Record<string, any> = {
  identifier: {
    field: 'id',
  },
  name: {
    field: 'name',
    name: 'Name',
  },
  price: { field: 'price' },
};
const domProps = {
  style: {
    margin: '5px',

    minHeight: '500px',
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button (click)="replaceAllData()">replaceAllData</button>
    <infinite-data-source
      [data]="dataSource"
      primaryKey="id"
      (ready)="onReady($event)"
    >
      <infinite-table
        [domProps]="domProps"
        [columnDefaultWidth]="150"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class ReplaceAllDataPage {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly domProps = domProps;

  private api: DataSourceApi<Car> | null = null;

  protected onReady(dataSourceApi: DataSourceApi<Car>) {
    this.api = dataSourceApi;
  }

  protected replaceAllData() {
    this.api?.replaceAllData([{ id: 10, name: 'Porsche', price: 60000 }]);
  }
}
